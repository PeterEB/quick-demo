quick-demo  
=================

A quick demo built up with [coap-shepherd](https://github.com/PeterEB/coap-shepherd).

## Table of Contents

1. [Overview](#Overview)  
2. [Installation](#Installation)  
3. [Usage](#Usage)  


<a name="Overview"></a>
## 1. Overview

Here is a quick demo app that show you what coap-shepherd can do, e,g,. allow devices to join, control devices. You can use this quick demo as a basis to create your own CoAP Web Application.

<a name="Installation"></a>
## 2. Installation

```shell
$ git clone https://github.com/PeterEB/quick-demo.git
$ cd quick-demo
/quick-demo $ npm install
```

<a name="Usage"></a>
## 3. Usage

Just need to type npm start in the console, server will start running.

```shell
/quick-demo $ npm start
```

When you first press the PERMIT JOIN button, server will create a few fake peripherals, used to display some simple applications. During this period, the real peripheral device can not join the network until the end of the first permit join.

The following figure shows the entire process from server startup to the first permit join end.

![coap-shepherd demo](https://github.com/PeterEB/quick-demo/tree/master/doc/quick%20demo.gif)  
