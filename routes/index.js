const router = require("koa-router")();
const child_process = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");

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

router.get("/", async (ctx, next) => {
  await ctx.render("index", {
    title: "Hello Koa 2!",
  });
});

router.get("/string", async (ctx, next) => {
  ctx.body = "koa2 string";
});

router.get("/getTxtRecord", async (ctx, next) => {
  const { domain } = ctx.query;
  console.log("domain", domain);
  if (!domain) {
    ctx.body = {
      code: 400,
      msg: "缺少domain参数",
    };
    return;
  }

  try {


    try {
      //判断是否存在证书了
      const certPath = path.join(config.certDir, `${domain}`, "fullchain.cer");
      const keyPath = path.join(config.certDir, `${domain}`, `${domain}.key`);
      let cert = "";
      let key = "";
      cert = fs.readFileSync(certPath, "utf8");
      key = fs.readFileSync(keyPath, "utf8");
      if (cert) {
        ctx.body = {
          code: 200,
          msg: "success",
          data: {
            stderr: "证书已经存在了,直接复制下载",
            stdout: "证书已经存在了,直接复制下载",
            cert: cert,
            key: key,
          },
        };
        return;
      }
    } catch (error) {
      console.log("证书内容cert1= 没有拿到证书==", error);
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
  const { domain, dnstype } = ctx.query;
  console.log("domain", domain);
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
    try {
      //判断是否存在证书了
      cert = fs.readFileSync(certPath, "utf8");
      key = fs.readFileSync(keyPath, "utf8");
      if (cert) {
        ctx.body = {
          code: 200,
          msg: "success",
          data: {
            stderr: "证书已经存在了,直接复制下载",
            stdout: "证书已经存在了,直接复制下载",
            cert: cert,
            key: key,
          },
        };
        return;
      }
    } catch (error) {
      console.log("证书内容cert1= 没有拿到证书==", error);
    }
    //acme.sh --renew -d *.wanzishu.online  --yes-I-know-dns-manual-mode-enough-go-ahead-please
    // 你可以使用 DNS 模块来查询 TXT 记录
    if (dnstype == 1) { //dns代理验证
      
      //acme.sh --issue  -d  ${domain} --challenge-alias bbxiuc.cn --dns dns_tencent --yes-I-know-dns-manual-mode-enough-go-ahead-please  -k 2048
      const { success, stdout, stderr } = await runAcmeCommand(
        `--issue  -d  ${domain} --challenge-alias bbxiuc.cn --dns dns_tencent -k 2048`
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
