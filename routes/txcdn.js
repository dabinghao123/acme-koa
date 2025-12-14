const router = require('koa-router')()

router.prefix('/txcdn')

router.get('/cdnText', function (ctx, next) {
    ctx.body = 'this is a us222ers response!'
})

router.get('/bar', function (ctx, next) {
    ctx.body = 'this is a users/bar response'
})

const tencentcloud = require('tencentcloud-sdk-nodejs');
const CdnClient = tencentcloud.cdn.v20180606.Client; // 导入对应产品模块的client models。
// const models = tencentcloud.cdn.v20180606.Models;

// 从环境变量获取配置，避免硬编码敏感信息
const clientConfig = {
    credential: {
        secretId: process.env.TENCENT_SECRET_ID || '',
        secretKey: process.env.TENCENT_SECRET_KEY || '',
    },
    region: '', // CDN 接口通常不需要 region
    profile: {
        httpProfile: {
            endpoint: 'cdn.tencentcloudapi.com',
        },
    },
};


/**
 * 添加腾讯云CDN域名
 * @param {Object} ctx - Koa上下文对象，包含请求和响应信息
 * @param {Function} next - Koa中间件next函数
 * @returns {Promise<Object>} 返回操作结果对象
 * @property {boolean} success - 操作是否成功
 * @property {string} [Message] - 错误信息（操作失败时返回）
 * @property {string} [Code] - 错误代码（操作失败时返回）
 * @property {string} [RequestId] - 请求ID（操作成功时返回）
 * @throws {Error} 当腾讯云API调用失败或参数验证失败时抛出错误
 */
/**
 * 验证域名格式
 * @param {string} domain - 域名
 * @returns {boolean} 是否为有效域名
 */
function isValidDomain(domain) {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(domain);
}

router.post("/AddCdnDomain", async (ctx, next) => {
    try {
        const {
            Domain,
            Origin = "shkt-online-web3-1317978474.cos.ap-shanghai.myqcloud.com" // 提供默认值，允许自定义
        } = ctx.request.body;

        if (!Domain) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '缺少必要参数：Domain' };
            return;
        }

        // 验证域名格式
        if (!isValidDomain(Domain)) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '域名格式无效' };
            return;
        }

        // 验证配置完整性
        if (!clientConfig.credential.secretId || !clientConfig.credential.secretKey) {
            ctx.status = 500;
            ctx.body = { success: false, Message: '腾讯云配置不完整，请检查环境变量' };
            return;
        }

        // 初始化客户端
        const client = new CdnClient(clientConfig);

        // 调用 AddCdnDomain
        const params = {
            "Domain": Domain,
            "ServiceType": "web",
            "Origin": {
                "Origins": [
                    Origin
                ],
                "OriginType": "cos",
                "ServerName": Origin,
                "CosPrivateAccess": "off",
                "OriginPullProtocol": "https"
            },
            "ProjectId": 0,
            "Https": {
                "Switch": "off"
            },
            "Area": "global",
            "OssPrivateAccess": {
                "Switch": "off"
            }
        };
        const data = await client.AddCdnDomain(params);
        if (data.Response) {
            if (data.Response.Error) { // 调用失败   
                console.error('腾讯云 CDN API 调用失败:', data.Response.Error.Code);
                console.error('腾讯云 CDN API 调用失败:', data.Response.Error.Message);
                ctx.body = {
                    success: false,
                    Message: data.Response.Error.Message,
                    Code: data.Response.Error.Code
                };
            } else {
                //data.Response.Result
                ctx.body = {
                    success: true,
                    RequestId: data.Response.RequestId,
                };
            }
        }

    } catch (error) {
        console.error('调用腾讯云 CDN API 失败:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            Message: error.message || '未知错误',
            Code: error.code,
        };
    }
});


/**
 * 查询腾讯云CDN域名信息
 * @param {Object} ctx - Koa上下文对象
 * @param {Function} next - Koa中间件next函数
 * @param {Object} ctx.request.body - 请求体参数
 * @param {string} ctx.request.body.Domain - 要查询的CDN域名
 * @returns {Object} 响应结果
 * @returns {boolean} success - 操作是否成功
 * @returns {Object} [Domains] - 查询到的域名信息（成功时返回）
 * @returns {string} [Message] - 错误信息（失败时返回）
 * @returns {string} [Code] - 错误代码（失败时返回）
 * @throws {Error} 当腾讯云API调用失败时抛出异常
 */
router.post("/DescribeDomains", async (ctx, next) => {
    try {
        const {
            Domain,
        } = ctx.request.body;

        if (!Domain) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '缺少必要参数：Domain' };
            return;
        }

        // 验证域名格式
        if (!isValidDomain(Domain)) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '域名格式无效' };
            return;
        }

        // 验证配置完整性
        if (!clientConfig.credential.secretId || !clientConfig.credential.secretKey) {
            ctx.status = 500;
            ctx.body = { success: false, Message: '腾讯云配置不完整，请检查环境变量' };
            return;
        }

        // 初始化客户端             
        const client = new CdnClient(clientConfig);
        // 调用 DeleteCdnDomain
        const params = {
            "Offset": 0,
            "Limit": 1,
            "Filters": [
                {
                    "Name": "domain",
                    "Value": [
                        Domain
                    ],
                    "Fuzzy": true
                }
            ]
        };
        const data = await client.DescribeDomains(params);
        if (data.Response) {
            if (data.Response.Error) { // 调用失败   
                console.error('腾讯云 CDN API 调用失败:', data.Response.Error.Code);
                console.error('腾讯云 CDN API 调用失败:', data.Response.Error.Message);
                ctx.body = {
                    success: false,
                    Message: data.Response.Error.Message,
                    Code: data.Response.Error.Code
                }
            } else {
                if (data.Response.Domains.length > 0) {
                    ctx.body = {
                        success: true,
                        Domains: data.Response.Domains[0]
                    };
                } else {
                    ctx.body = {
                        success: false,
                        Message: "未找到该域名"
                    };
                }
            }
        }
    } catch (error) {
        console.error('调用腾讯云 CDN API 失败:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            Message: error.message || '未知错误',
            Code: error.code,
        };
    }
});


/**
 * 更新腾讯云CDN域名的HTTPS配置
 * @param {Object} ctx - Koa上下文对象，包含请求和响应信息
 * @param {Function} next - Koa中间件next函数
 * @param {Object} ctx.request.body - 请求体参数
 * @param {string} ctx.request.body.Domain - 需要更新的CDN域名
 * @param {Object} ctx.request.body.CertInfo - 证书信息对象
 * @param {string} ctx.request.body.CertInfo.Certificate - SSL证书内容
 * @param {string} ctx.request.body.CertInfo.PrivateKey - 证书私钥
 * @returns {Object} 响应对象
 * @returns {boolean} success - 操作是否成功
 * @returns {string} [Message] - 错误信息（操作失败时返回）
 * @returns {string} [Code] - 错误代码（操作失败时返回）
 * @returns {string} [RequestId] - 请求ID（操作成功时返回）
 * @throws {Error} 当调用腾讯云API失败时抛出异常
 */
router.post("/UpdateDomainConfig", async (ctx, next) => {
    try {
        const {
            Domain,
            CertInfo = {},
        } = ctx.request.body;
        
        if (!Domain) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '缺少必要参数：Domain' };
            return;
        }

        if (!CertInfo.Certificate || !CertInfo.PrivateKey) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '缺少必要参数：CertInfo.Certificate 或 CertInfo.PrivateKey' };
            return;
        }

        // 验证域名格式
        if (!isValidDomain(Domain)) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '域名格式无效' };
            return;
        }

        // 验证证书格式（简单检查）
        if (!CertInfo.Certificate.includes('-----BEGIN') || !CertInfo.PrivateKey.includes('-----BEGIN')) {
            ctx.status = 400;
            ctx.body = { success: false, Message: '证书格式无效' };
            return;
        }

        // 验证配置完整性
        if (!clientConfig.credential.secretId || !clientConfig.credential.secretKey) {
            ctx.status = 500;
            ctx.body = { success: false, Message: '腾讯云配置不完整，请检查环境变量' };
            return;
        }

        // 初始化客户端             
        const client = new CdnClient(clientConfig);
        // 调用 DeleteCdnDomain
        const params = {
            "Domain": Domain,
            "ProjectId": 0,
            "Https": {
                "CertInfo": {
                    "Certificate": CertInfo.Certificate,
                    "PrivateKey": CertInfo.PrivateKey
                }
            }
        };
        const data = await client.UpdateDomainConfig(params);
        if (data.Response) {
            if (data.Response.Error) { // 调用失败   
                console.error('腾讯云 CDN API 调用失败:', data.Response.Error.Code);
                console.error('腾讯云 CDN API 调用失败:', data.Response.Error.Message);
                ctx.body = {
                    success: false,
                    Message: data.Response.Error.Message,
                    Code: data.Response.Error.Code
                }
            } else {
                ctx.body = {
                    success: true,
                    RequestId: data.Response.RequestId,
                };
            }
        }
    } catch (error) {
        console.error('调用腾讯云 CDN API 失败:', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            Message: error.message || '未知错误',
            Code: error.code,
        };
    }   
});




module.exports = router
