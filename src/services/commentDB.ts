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


// 使用类封装数据库，继承自 Dexie
class CommentDB extends Dexie {
  // 表：userComments，类型为 Comment，主键为 number
  public userComments: Dexie.Table<Comment, number>

  constructor() {
    // 创建数据库名为 'MyDatabase'
    super('MyDatabase')

    // 定义数据库版本和表结构
    this.version(1).stores({
      // 表名 userComments，主键为自增 id，索引字段包括 userId 和 timestamp
      userComments: 'userId, timestamp'
    })

    // 获取表对象，方便后续操作
    this.userComments = this.table('userComments')
  }

  // 添加一条评论
  async addComment(comment: Comment): Promise<string> {
    try {
      // // 如果没有传入 commentId，自动生成一个 UUID
      // if (!comment.userId) {
      //   comment.userId = uuidv4()
      // }

      // 使用 put 方法，插入或更新评论记录
      await this.userComments.put(comment)
      console.log(`✅ Added comment with userId ${comment.userId}`)
      return comment.userId
    } catch (err) {
      console.error('❌ Failed to add comment:', err)
      throw err
    }
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
export const commentDB = new CommentDB()




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