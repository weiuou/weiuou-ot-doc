export const CONFIG = {
  SERVER: {
    // 服务器 IP 地址和端口
    HOST: 'localhost',
    PORT: '8080',
    // API 和 WebSocket 路径
    API_PATH: '/api/doc',
    WS_PATH: '/ws/doc'
  },
  // 获取完整的 HTTP URL
  get apiUrl() {
    return `http://${this.SERVER.HOST}:${this.SERVER.PORT}${this.SERVER.API_PATH}`;
  },
  // 获取完整的 WebSocket URL
  get wsUrl() {
    return `ws://${this.SERVER.HOST}:${this.SERVER.PORT}${this.SERVER.WS_PATH}`;
  }
};