



export class SyncToFeishu{

    /**
     * 获取飞书应用的tenant_access_token
     *
     * 此 token 用于后续调用飞书开放平台的企业级 API，例如多维表格、审批等服务。
     *
     * @param appId - 飞书应用的 App ID（应用凭证）
     * @param appSecret - 飞书应用的 App Secret（应用密钥）
     * @returns Promise<string> - 返回租户级 access token 字符串
     * @throws 若请求失败、网络错误或响应数据结构异常，会抛出错误
     */
    private async getFeishuToken(appId: string, appSecret: string): Promise<string> {
      const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret
        })
      })

      const data = await res.json()
      //console.log("返回的完整数据 =", data)
      //console.log("tenant_access_token =", data.tenant_access_token)
      return data.tenant_access_token
    }
  

    /**
     * 向飞书多维表格中批量创建记录。
     *
     * @param data 要写入飞书表格的数据，格式为 { records: [ { fields: { 字段名: 值 } }, ... ] }
     * @param tenantAccessToken 飞书的tenantAccessToken，可以用getFeishuToken获取到
     * @param appToken 飞书多维表格的 App ID（应用 token）
     * @param table_id 多维表格中具体表的 ID
     * @returns 飞书接口的响应结果，通常包含记录 ID、状态等信息
     * @throws 网络异常、鉴权失败或接口返回错误时会抛出异常
     */
    private async createRecords(data: any, tenantAccessToken: string, appToken: string, table_id: string) {
      const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${table_id}/records/batch_create`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tenantAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
        const result = await response.json();
        // console.log('同步到飞书的内容:', result);
        return result
      } catch (error) {
        console.error('调用 createRecords 同步数据到飞书 Error:', error);
        throw error;
      }
    }


    public async syncRunningStateToFeishu() {
      
      const tenantAccessToken = await this.getFeishuToken(process.env.PLASMO_PUBLIC_FEISHU_APP_ID, process.env.PLASMO_PUBLIC_FEISHU_APP_SECRET)
      console.log("拿到的 token =", tenantAccessToken)

      const data = {
        records: [
          {
            fields: {
              文本: '文本内容',
              人员: '123',
            },
          },
          {
            fields: {
              文本: '文本内容2',
              人员: '1234',
            },
          },
        ],
      };

      const appToken = process.env.PLASMO_PUBLIC_FEISHU_APP_TOKEN
      const table_id = process.env.PLASMO_PUBLIC_FEISHU_TABLE_ID
      const respond = await this.createRecords(data, tenantAccessToken, appToken, table_id)
      console.log('请求成功，返回数据:', respond);
      
    }

}
