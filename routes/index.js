const router = require("koa-router")();
// const fs = require('fs')
const child_process = require("child_process");
const util = require("util");

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
    //acme.sh --issue --dns -d *.wanzishu.online  --yes-I-know-dns-manual-mode-enough-go-ahead-please
    //acme.sh --renew -d *.wanzishu.online  --yes-I-know-dns-manual-mode-enough-go-ahead-please
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
          stderr: stdout,
          stdout: stderr,
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
    //acme.sh --renew -d *.wanzishu.online  --yes-I-know-dns-manual-mode-enough-go-ahead-please
    // 你可以使用 DNS 模块来查询 TXT 记录
    const { success, stdout, stderr } = await runAcmeCommand(
      `--renew -d ${domain} --yes-I-know-dns-manual-mode-enough-go-ahead-please`
    );
    console.log(success, stdout, stderr);
    if (success) {
      ctx.body = {
        code: 200,
        msg: "success",
        data: {
          stderr: stdout.stderr,
          stdout: stdout.stdout,
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

module.exports = router;
