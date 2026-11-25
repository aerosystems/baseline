# Rest server in Golang

Small rest server in go made to learn client-server http programming.

I tried to make it using modular/sliced architectural approach instead of layered one.

Currently present modules:
- restaurant: domain database and related crud rest api
- auth: user and authorization handling

Also has 2 helper modules:
- minidb: thin database abstraction layer
- util: random utilities need through out the system
