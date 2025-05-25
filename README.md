# acme-koa
acme-koa
[root@VM-6-129-centos ~]# acme.sh --issue  -d  aa.pbuoor.cn --challenge-alias bbxiuc.cn --dns dns_tencent
[Sun May 25 18:58:58 CST 2025] Using CA: https://acme.zerossl.com/v2/DV90
[Sun May 25 18:58:58 CST 2025] Single domain='aa.pbuoor.cn'
[Sun May 25 18:59:01 CST 2025] Could not get nonce, let's try again.
[Sun May 25 18:59:07 CST 2025] Could not get nonce, let's try again.
[Sun May 25 18:59:14 CST 2025] Could not get nonce, let's try again.
[Sun May 25 18:59:20 CST 2025] Could not get nonce, let's try again.
[Sun May 25 19:01:30 CST 2025] Please refer to https://curl.haxx.se/libcurl/c/libcurl-errors.html for error code: 7
[Sun May 25 19:03:05 CST 2025] Getting webroot for domain='aa.pbuoor.cn'
[Sun May 25 19:03:05 CST 2025] Adding TXT value: 8IgZVBDhqTxgzdY3yVytXJOFfPUXR2gChuevy6Ypwyk for domain: _acme-challenge.bbxiuc.cn
[Sun May 25 19:03:07 CST 2025] The TXT record has been successfully added.
[Sun May 25 19:03:07 CST 2025] Let's check each DNS record now. Sleeping for 20 seconds first.
[Sun May 25 19:03:28 CST 2025] You can use '--dnssleep' to disable public dns checks.
[Sun May 25 19:03:28 CST 2025] See: https://github.com/acmesh-official/acme.sh/wiki/dnscheck
[Sun May 25 19:03:28 CST 2025] Checking aa.pbuoor.cn for _acme-challenge.bbxiuc.cn
[Sun May 25 19:03:29 CST 2025] Please refer to https://curl.haxx.se/libcurl/c/libcurl-errors.html for error code: 35
[Sun May 25 19:03:36 CST 2025] Please refer to https://curl.haxx.se/libcurl/c/libcurl-errors.html for error code: 7
[Sun May 25 19:03:37 CST 2025] Success for domain aa.pbuoor.cn '_acme-challenge.bbxiuc.cn'.
[Sun May 25 19:03:37 CST 2025] All checks succeeded
[Sun May 25 19:03:37 CST 2025] Verifying: aa.pbuoor.cn
[Sun May 25 19:04:14 CST 2025] Processing. The CA is processing your order, please wait. (1/30)
[Sun May 25 19:04:59 CST 2025] Success
[Sun May 25 19:04:59 CST 2025] Removing DNS records.
[Sun May 25 19:04:59 CST 2025] Removing txt: 8IgZVBDhqTxgzdY3yVytXJOFfPUXR2gChuevy6Ypwyk for domain: _acme-challenge.bbxiuc.cn
[Sun May 25 19:05:01 CST 2025] Successfully removed
[Sun May 25 19:05:01 CST 2025] Verification finished, beginning signing.
[Sun May 25 19:05:01 CST 2025] Let's finalize the order.
[Sun May 25 19:05:01 CST 2025] Le_OrderFinalize='https://acme.zerossl.com/v2/DV90/order/NBnnhVQB03qBf7ek37lYzg/finalize'
[Sun May 25 19:05:03 CST 2025] Order status is 'processing', let's sleep and retry.
[Sun May 25 19:05:03 CST 2025] Sleeping for 15 seconds then retrying
[Sun May 25 19:05:19 CST 2025] Polling order status: https://acme.zerossl.com/v2/DV90/order/NBnnhVQB03qBf7ek37lYzg
[Sun May 25 19:05:56 CST 2025] Downloading cert.
[Sun May 25 19:05:56 CST 2025] Le_LinkCert='https://acme.zerossl.com/v2/DV90/cert/9-ObGzR-9p9E3QnpEyQPbg'
[Sun May 25 19:06:28 CST 2025] Cert success