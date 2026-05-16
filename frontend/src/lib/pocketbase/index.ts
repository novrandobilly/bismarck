import PocketBase from 'pocketbase'

const url = import.meta.env.VITE_POCKETBASE_URL
if (!url) throw new Error('VITE_POCKETBASE_URL environment variable is required')

export const pb = new PocketBase(url)
pb.autoCancellation(false)
