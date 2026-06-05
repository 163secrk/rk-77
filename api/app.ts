import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { MemoryStore } from './store/MemoryStore.js'
import { RoomService } from './services/RoomService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const memoryStore = MemoryStore.getInstance()
const roomService = new RoomService()

app.get('/api/health', (req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok' })
})

app.get('/api/rooms/:roomId', (req: Request, res: Response): void => {
  const roomId = req.params.roomId.toUpperCase()
  const roomInfo = roomService.getRoomInfo(roomId)

  if (!roomInfo) {
    res.status(200).json({ exists: false })
    return
  }

  res.status(200).json({
    exists: true,
    roomInfo: {
      ...roomInfo,
      isFull: roomInfo.currentPlayers >= roomInfo.maxPlayers,
    },
  })
})

app.get('/api/stats', (req: Request, res: Response): void => {
  res.status(200).json({
    roomCount: memoryStore.getRoomCount(),
  })
})

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
