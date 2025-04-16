# OT-docs

基于 OT 算法（Operational Transformation，操作变换）的在线协作文档系统。

## 项目简介

OT-docs 是一个支持多人协作编辑的在线文档项目，前端采用 React + Markdown 编辑器，后端基于 Spring Boot 实现操作同步、变换和广播，支持富文本编辑和实时协作。

## 技术栈

- **前端**：React、TypeScript、Vite、TailwindCSS、@uiw/react-md-editor
- **后端**：Spring Boot（Java 17）
- **协作算法**：OT（Operational Transformation）

## 功能特性

- Markdown 富文本编辑
- 文本插入、删除、替换操作规范化
- 操作记录展示
- OT 算法基础支持
- 多用户协作（开发中）
- 用户光标显示（规划中）
- 批注同步（规划中）

## 目录结构

```
OT-docs-front/      # 前端项目（React + Vite）
ot_doc/             # 后端项目（Spring Boot）
开发日志/           # 项目开发日志与文档
```

## 快速开始

### 前端

```bash
cd OT-docs-front
npm install
npm run dev
```

### 后端

```bash
cd ot_doc
./mvnw spring-boot:run
```
或在 Windows 下：
```bash
cd ot_doc
mvnw.cmd spring-boot:run
```

### 访问

前端默认运行在 [http://localhost:5173](http://localhost:5173)

后端默认运行在 [http://localhost:8080](http://localhost:8080)

## 开发计划

- [x] 基础文档功能
- [x] 文本编辑插入删除功能
- [x] 富文本编辑 markdown 部分的操作转换
- [ ] 多用户操作同步
- [ ] 用户光标显示
- [ ] 批注同步

## 贡献

欢迎提交 Issue 和 PR！

## License

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)
