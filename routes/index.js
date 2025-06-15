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
    // 这里可以添加获取 TXT 记录的逻辑
    //acme.sh --issue --dns -d *.demo.com  --yes-I-know-dns-manual-mode-enough-go-ahead-please
    //acme.sh --renew -d *.demo.com   --yes-I-know-dns-manual-mode-enough-go-ahead-please
    // 你可以使用 DNS 模块来查询 TXT 记录
    const { success, stdout, stderr } = await runAcmeCommand(
      `--issue --dns -d ${domain} --yes-I-know-dns-manual-mode-enough-go-ahead-please`
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
    //判断是否存在证书了
    const certPath = path.join(
      config.certDir,
      `${domain}_ecc`,
      "fullchain.cer"
    );
    const keyPath = path.join(config.certDir, `${domain}_ecc`, `${domain}.key`);
    let cert = "";
    let key = "";
    try {
      cert = fs.readFileSync(certPath, "utf8");
    } catch (error) {}

    if (cert) {
      //存在证书了
      try {
        key = fs.readFileSync(keyPath, "utf8");
      } catch (error) {
        console.log("证书内容cert1= 没有拿到证书==");
      }
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
    //acme.sh --renew -d *.wanzishu.online  --yes-I-know-dns-manual-mode-enough-go-ahead-please
    // 你可以使用 DNS 模块来查询 TXT 记录
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
        console.log("证书内容cert1= 没有拿到证书==");
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
  } catch (error) {
    ctx.body = {
      code: 500,
      msg: "获取 证书失败 记录失败2",
      error: error,
    };
  }
});

router.get("/getMyIp", async (ctx, next) => {
  console.log("getMyIp===1=",ctx.ip)
  console.log("getMyIp===2=",ctx.request)
  ctx.body = {
    name:"我的ip",
    "ip":ctx.get('X-Forwarded-For')?.split(',')[0] || ctx.ip
 }
});

module.exports = router;
