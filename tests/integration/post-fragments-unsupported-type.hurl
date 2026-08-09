# Authenticated POST to /v1/fragments with unsupported Content-Type
POST http://localhost:8080/v1/fragments
Content-Type: application/pdf
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`not-a-pdf`

HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
