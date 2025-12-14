const router = require("koa-router")();
const child_process = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const execAsync = util.promisify(child_process.exec);
// Configuration
const config = {
  acmePath: process.env.ACME_PATH || "/root/.acme.sh/acme.sh",
  certDir: process.env.CERT_DIR || "/root/.acme.sh",
  port: process.env.PORT || 3000,
};
// Helper function to run acme.sh commands
async function runAcmeCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(`${config.acmePath} ${command}`);
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: true, stdout: error };
  }
}

// Helper function to check certificate expiration
async function checkCertificateExpiration(certContent) {
  try {
    // 使用openssl命令解析证书
    const tempFile = `/tmp/cert_${Date.now()}.pem`;
    fs.writeFileSync(tempFile, certContent);
    console.log("tempFile===",tempFile)
    const { success, stdout, stderr } = await runAcmeCommand(`openssl x509 -in ${tempFile} -noout -dates`);
    //  child_process.execSync(`openssl x509 -in ${tempFile} -noout -dates`, { encoding: 'utf8' });
    fs.unlinkSync(tempFile); // 清理临时文件
    console.log("stdout====",stdout)
    // 解析输出获取到期时间
    const lines = stdout.split('\n');
    let notAfter = null;
    
    for (const line of lines) {
      if (line.startsWith('notAfter=')) {
        notAfter = new Date(line.replace('notAfter=', ''));
        break;
      }
    }
    console.log("notAfter=3333===",notAfter)
    if (!notAfter) {
      return { valid: false, error: '无法解析证书到期时间' };
    }
    console.log("notAfter===bing===",notAfter)
    const now = new Date();
    const daysUntilExpiry = Math.ceil((notAfter - now) / (1000 * 60 * 60 * 24));
    console.log("notAfter===bing=222==",daysUntilExpiry)
    return {
      valid: true,
      expiryDate: notAfter,
      daysUntilExpiry: daysUntilExpiry,
      isExpired: daysUntilExpiry <= 0,
      isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Helper function to get certificate status
async function getCertificateStatus(domain) {
  try {
    const certPath = path.join(config.certDir, `${domain}`, "fullchain.cer");
    const keyPath = path.join(config.certDir, `${domain}`, `${domain}.key`);
    
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      return { exists: false, message: '证书文件不存在' };
    }
    
    const cert = fs.readFileSync(certPath, "utf8");
    const key = fs.readFileSync(keyPath, "utf8");
    
    const expiryInfo = await checkCertificateExpiration(cert);
    
    return {
      exists: true,
      cert: cert,
      key: key,
      expiry: expiryInfo
    };
  } catch (error) {
    return { exists: false, message: error.message };
  }
}

function deleteCertificate(domain) {
  return new Promise((resolve, reject) => {
    //删除文件夹
    const command = `rm -rf ${config.certDir}/${domain}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "Hello Koa 2!",
  });
});

router.get("/dbname", async (ctx, next) => {
  const [rows] =  await ctx.db.execute('SELECT * FROM domains');
  ctx.body = {
    code: 200,
    msg: "success",
    data: rows
  };
});

// 检查证书状态的API
router.get("/checkCertStatus", async (ctx, next) => {
  const { domain } = ctx.query;
  
  if (!domain) {
    ctx.body = {
      code: 400,
      msg: "缺少domain参数",
    };
    return;
  }

  try {
    const status = await getCertificateStatus(domain);
    
    if (!status.exists) {
      ctx.body = {
        code: 404,
        msg: "证书不存在",
        data: {
          exists: false,
          message: status.message
        }
      };
      return;
    }

    let statusMessage = "证书有效";
    let statusType = "valid";
    let errorMessage = '';
    
    if (!status.expiry.valid) {
      statusMessage = "证书解析失败";
      statusType = "error";
      errorMessage = status.message;
    } else if (status.expiry.isExpired) {
      statusMessage = "证书已过期";
      statusType = "expired";
    } else if (status.expiry.isExpiringSoon) {
      statusMessage = `证书即将过期（剩余${status.expiry.daysUntilExpiry}天）`;
      statusType = "expiring";
    } else {
      statusMessage = `证书有效（剩余${status.expiry.daysUntilExpiry}天）`;
      statusType = "valid";
    }

    ctx.body = {
      code: 200,
      msg: "success",
      data: {
        exists: true,
        domain: domain,
        statusType: statusType,
        statusMessage: statusMessage,
        status: status,
        expiryDate: status.expiry.expiryDate,
        daysUntilExpiry: status.expiry.daysUntilExpiry,
        isExpired: status.expiry.isExpired,
        isExpiringSoon: status.expiry.isExpiringSoon,
        cert: status.cert,
        key: status.key,
        msg: "检查证书状态失败2222"
      }
    };
  } catch (error) {
    ctx.body = {
      code: 500,
      msg: "检查证书状态失败",
      error: error.message,
    };
  }
});

router.get("/getTxtRecord", async (ctx, next) => {
  const { domain, forceRenew } = ctx.query;
  console.log("domain", domain, "forceRenew", forceRenew);
  if (!domain) {
    ctx.body = {
      code: 400,
      msg: "缺少domain参数",
    };
    return;
  }

  try {
    // 检查证书状态
    const status = await getCertificateStatus(domain);
    
    // 如果证书存在且没有强制重新生成，检查是否需要续期
    if (status.exists && !forceRenew) {
      if (status.expiry.valid && !status.expiry.isExpired && !status.expiry.isExpiringSoon) {
        // 证书有效且不即将过期，直接返回现有证书
        ctx.body = {
          code: 200,
          msg: "success",
          data: {
            stderr: `证书有效（剩余${status.expiry.daysUntilExpiry}天），直接使用现有证书`,
            stdout: `证书有效（剩余${status.expiry.daysUntilExpiry}天），直接使用现有证书`,
            cert: status.cert,
            key: status.key,
            certStatus: {
              statusType: "valid",
              daysUntilExpiry: status.expiry.daysUntilExpiry,
              expiryDate: status.expiry.expiryDate
            }
          },
        };
        return;
      } else if (status.expiry.valid && (status.expiry.isExpired || status.expiry.isExpiringSoon)) {
        // 证书过期或即将过期，提示用户
        const message = status.expiry.isExpired ? 
          "证书已过期，需要重新生成" : 
          `证书即将过期（剩余${status.expiry.daysUntilExpiry}天），建议重新生成`;
        
        ctx.body = {
          code: 200,
          msg: "success",
          data: {
            stderr: message,
            stdout: message,
            cert: status.cert,
            key: status.key,
            certStatus: {
              statusType: status.expiry.isExpired ? "expired" : "expiring",
              daysUntilExpiry: status.expiry.daysUntilExpiry,
              expiryDate: status.expiry.expiryDate,
              needsRenewal: true
            }
          },
        };
        return;
      }
    }else if(status.exists && forceRenew){ //存在证书
         //删除旧证书
         await deleteCertificate(domain);
    }
    // 这里可以添加获取 TXT 记录的逻辑
    //acme.sh --issue --dns -d *.demo.com  --yes-I-know-dns-manual-mode-enough-go-ahead-please
    //acme.sh --renew -d *.demo.com   --yes-I-know-dns-manual-mode-enough-go-ahead-please
    // 你可以使用 DNS 模块来查询 TXT 记录
    const { success, stdout, stderr } = await runAcmeCommand(
      `--issue --dns -d ${domain} --yes-I-know-dns-manual-mode-enough-go-ahead-please  -k 2048`
    );
    console.log(success, stdout, stderr);
    if (success) {
      ctx.body = {
        code: 200,
        msg: "success",
        data: {
          stderr: stdout.stderr || stderr,
          stdout: stdout.stdout || stdout,
        },
      };
    } else {
      ctx.body = {
        code: 500,
        msg: "获取 TXT 记录失败1",
        error: stderr,
      };
    }
  } catch (error) {
    ctx.body = {
      code: 500,
      msg: "获取 TXT 记录失败2",
      error: error,
    };
  }
});

// 获取证书验证dns
router.get("/validate", async (ctx, next) => {
  const { domain, dnstype, forceRenew } = ctx.query;
  console.log("domain", domain, "dnstype", dnstype, "forceRenew", forceRenew);
  if (!domain) {
    ctx.body = {
      code: 400,
      msg: "缺少domain参数",
    };
    return;
  }

  try {
    let cert = "";
    let key = "";
    const certPath = path.join(config.certDir, `${domain}`, "fullchain.cer");
    const keyPath = path.join(config.certDir, `${domain}`, `${domain}.key`);
    
    // 检查证书状态
    const status = await getCertificateStatus(domain);
    
    // 如果证书存在且没有强制重新生成，检查是否需要续期
    if (status.exists && !forceRenew) {
      if (status.expiry.valid && !status.expiry.isExpired && !status.expiry.isExpiringSoon) {
        // 证书有效且不即将过期，直接返回现有证书
        ctx.body = {
          code: 200,
          msg: "success",
          data: {
            stderr: `证书有效（剩余${status.expiry.daysUntilExpiry}天），直接使用现有证书`,
            stdout: `证书有效（剩余${status.expiry.daysUntilExpiry}天），直接使用现有证书`,
            cert: status.cert,
            key: status.key,
            certStatus: {
              statusType: "valid",
              daysUntilExpiry: status.expiry.daysUntilExpiry,
              expiryDate: status.expiry.expiryDate
            }
          },
        };
        return;
      }
    }
    //acme.sh --renew -d *.wanzishu.online  --yes-I-know-dns-manual-mode-enough-go-ahead-please
    // 你可以使用 DNS 模块来查询 TXT 记录
    if (dnstype == 1) { //dns代理验证
      
      //acme.sh --issue  -d  ${domain} --challenge-alias bbxiuc.cn --dns dns_tencent --yes-I-know-dns-manual-mode-enough-go-ahead-please  -k 2048
      const commandText =  (`${forceRenew}` === "true" ? `--renew -d ${domain} --yes-I-know-dns-manual-mode-enough-go-ahead-please` : `--issue  -d  ${domain} --challenge-alias bbxiuc.cn --dns dns_tencent -k 2048` )
      console.log("====commandText======",commandText)
      const { success, stdout, stderr } = await runAcmeCommand(commandText);
      console.log(success, stdout, stderr);
      if (success) {
        try {
          key = fs.readFileSync(keyPath, "utf8");
          cert = fs.readFileSync(certPath, "utf8");
          // 读取证书文件
          console.log("证书内容cert1===", cert, "证书内容cert1===");
        } catch (error) {
          console.log("证书内容cert1= 没有拿到证书==", error);
        }
        ctx.body = {
          code: 200,
          msg: "success",
          data: {
            stderr: stdout.stderr || stderr,
            stdout: stdout.stdout || stdout,
            cert: cert,
            key: key,
          },
        };
      } else {
        ctx.body = {
          code: 500,
          msg: "获取 证书失败 记录失败1",
          error: stderr,
        };
      }
    } else {
      const { success, stdout, stderr } = await runAcmeCommand(
        `--renew -d ${domain} --yes-I-know-dns-manual-mode-enough-go-ahead-please`
      );
      console.log(success, stdout, stderr);
      if (success) {
        try {
          key = fs.readFileSync(keyPath, "utf8");
          cert = fs.readFileSync(certPath, "utf8");
          // 读取证书文件
          console.log("证书内容cert1===", cert, "证书内容cert1===");
        } catch (error) {
          console.log("证书内容cert1= 没有拿到证书==", error);
        }
        ctx.body = {
          code: 200,
          msg: "success",
          data: {
            stderr: stdout.stderr || stderr,
            stdout: stdout.stdout || stdout,
            cert: cert,
            key: key,
          },
        };
      } else {
        ctx.body = {
          code: 500,
          msg: "获取 证书失败 记录失败1",
          error: stderr,
        };
      }
    }

  } catch (error) {
    ctx.body = {
      code: 500,
      msg: "获取 证书失败 记录失败2",
      error: error,
    };
  }
});

module.exports = router;