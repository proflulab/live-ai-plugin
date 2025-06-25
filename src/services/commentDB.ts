import Dexie from 'dexie'
import { v4 as uuidv4 } from 'uuid'

// 定义一条评论的结构类型
export interface Comment {
  userId?: string          // 用户ID，随机生成uuid
  userName: string        // 用户名
  userType: string        // 用户类型，例如 VIP、普通用户
  timestamp: number       // 添加评论的时间戳（用于排序或筛选）
  commentTime: string     // 评论时间（可读格式）
  content: string         // 评论内容
  reply: string           // 回复内容
}

export interface FeishuToken {
  token: string       // token 内容
  expire: number      // 过期时间（单位：毫秒）
  fetchedAt: number   // 获取时间戳，用于计算剩余时间
}


// 使用类封装数据库，继承自 Dexie
class CommentDB extends Dexie {
  // 表：userComments，类型为 Comment，主键为 number
  public userComments: Dexie.Table<Comment, number>
  // 表：feishuToken，类型为 FeishuToken，主键为 number
  public feishuToken: Dexie.Table<FeishuToken, number>

  constructor(dbName: string) {
    // 创建数据库名为 'MyDatabase'
    super(dbName)

    // 定义数据库版本和表结构
    this.version(1).stores({
      // 表名 userComments，主键为自增 id，索引字段包括 userId 和 timestamp
      // 表名 feishuToken，主键为自增 id，索引字段包括 fetchedAt(毫秒级时间戳) 和 timestamp
      userComments: '++id, userId, timestamp',
      feishuToken: '++id, fetchedAt' 

    })

    // 获取表对象，方便后续操作
    this.userComments = this.table('userComments')
    this.feishuToken = this.table('feishuToken')  
  }

  // 添加一条评论
  async addComment(comment: Comment): Promise<string> {
    try {
      // 使用 put 方法，插入或更新评论记录
      await this.userComments.put(comment)
      console.log(`✅ Added comment with userId ${comment.userId}`)
      return comment.userId
    } catch (err) {
      console.error('❌ Failed to add comment:', err)
      throw err
    }
  }

  // 储存飞书token到数据库
  async saveFeishuToken(token: FeishuToken): Promise<void> {
    try {
      await this.feishuToken.put(token)  // token.fetchedAt 必须唯一
      console.log('✅ Saved Feishu token')
    } catch (err) {
      console.error('❌ Failed to add saveFeishuToken:', err)
      throw err
    }
  }

  // 从数据库获取飞书token
  // 获取最新一条：
  async getFeishuToken(): Promise<FeishuToken | undefined> {
    return await this.feishuToken.orderBy('fetchedAt').reverse().first()
  }


  // 获取所有评论
  async getAllComments(): Promise<Comment[]> {
    return await this.userComments.toArray()
  }

  // // 根据 ID 删除一条评论
  // async deleteComment(userId: string): Promise<void> {
  //   await this.userComments.delete(userId)
  // }  

  // 清空所有评论
  async clearAllComments(): Promise<void> {
    await this.userComments.clear()
  }
}


// 导出一个数据库实例，其他地方直接导入使用
export const commentDB = new CommentDB('MyDatabase')





// 调用方法
// import { commentDB } from './services/commentDB'
// import { v4 as uuidv4 } from 'uuid'

// // 添加一条评论
// commentDB.addComment({
//   userId: uuidv4(),
//   userName: 'Alice',
//   userType: 'VIP',
//   timestamp: Date.now(),
//   commentTime: new Date().toLocaleString(),
//   content: '这个功能真棒！',
//   reply: '谢谢你的反馈！'
// })


// // 保存 token
// commentDB.saveFeishuToken({
//   token: 'AJDSAKJDAK',
//   expire: 7200,
//   fetchedAt: Math.floor(Date.now() / 1000) // 秒级时间戳
// })