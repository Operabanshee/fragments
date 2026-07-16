# Authenticated POST to /v1/fragments with unsupported Content-Type
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`not-an-image`

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
