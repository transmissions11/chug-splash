import { ChugSplashServer } from './server'

const main = async () => {
  const server = new ChugSplashServer({
    port: 7879,
    hostname: 'localhost',
  })

  await server.start()
}

main()
