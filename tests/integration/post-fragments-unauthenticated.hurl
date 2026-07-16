# Unauthenticated POST to /v1/fragments should be denied
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
`No auth should fail`

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
