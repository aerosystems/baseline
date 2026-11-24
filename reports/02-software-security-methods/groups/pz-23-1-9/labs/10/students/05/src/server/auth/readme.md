Users and authorization management module.

Exports WithAuth middleware, user roles and endpoint registration

Depends on minidb and util modules

Auth happens with Authorization http header. 
Supports Basic (login:password) and Bearer (JWT) scheme.

JWT support is pretty basic, its just an access tocken without timeout.
