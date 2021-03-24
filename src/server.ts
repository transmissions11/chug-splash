import { BaseService } from '@eth-optimism/service-base'
import express from 'express'
import cors from 'cors'
import { NativeCompiler } from 'hardhat/internal/solidity/compiler'
import { CompilerDownloader } from 'hardhat/internal/solidity/compiler/downloader'

export interface ChugSplashServerOptions {
  port?: number
  hostname?: string
  compilerCache?: string
}

export class ChugSplashServer extends BaseService<ChugSplashServerOptions> {
  protected name = 'Chug Splash Server'
  protected optionSettings = {
    port: {
      default: 7879,
    },
    hostname: {
      default: 'localhost',
    },
    compilerCache: {
      default: './compilers',
    },
  }

  private state: {
    app: express.Express
    server: any
    downloader: CompilerDownloader
    compiler: NativeCompiler
    cache: {
      [solcVersion: string]: boolean
    }
  } = {} as any

  protected async _init(): Promise<void> {
    this.state.downloader = new CompilerDownloader(this.options.compilerCache)
    this.state.cache = {}
    this.state.compiler = new NativeCompiler('solc')
    this.state.app = express()
    this.state.app.use(cors())
    this.state.app.use(express.json())
    this._registerAllRoutes()
  }

  protected async _start(): Promise<void> {
    this.state.server = this.state.app.listen(
      this.options.port,
      this.options.hostname
    )

    this.logger.info('Server started and listening', {
      host: this.options.hostname,
      port: this.options.port,
    })
  }

  protected async _stop(): Promise<void> {
    this.state.server.close()
    this.logger.info('Server stopped')
  }

  /**
   * Registers a route on the server.
   * @param method Http method type.
   * @param route Route to register.
   * @param handler Handler called and is expected to return a JSON response.
   */
  private _registerRoute(
    method: 'get' | 'GET' | 'post' | 'POST',
    route: string,
    handler: (req?: express.Request) => Promise<any>
  ): void {
    // TODO: Better typing on the return value of the handler function.
    // TODO: Check for route collisions.
    // TODO: Add a different function to allow for removing routes.

    this.state.app[method.toLowerCase()](
      route,
      async (req: express.Request, res: express.Response) => {
        const start = Date.now()
        try {
          const json = await handler(req)
          const elapsed = Date.now() - start
          this.logger.info('Served HTTP Request', {
            method: req.method,
            url: req.url,
            elapsed,
          })
          return res.json(json)
        } catch (e) {
          const elapsed = Date.now() - start
          this.logger.info('Failed HTTP Request', {
            method: req.method,
            url: req.url,
            elapsed,
            err: e.toString(),
          })
          return res.status(400).json({
            error: e.toString(),
          })
        }
      }
    )
  }

  private _registerAllRoutes(): void {
    this._registerRoute('POST', '/compile', async (req: { body: any }) => {
      if (!this.state.cache[req.body.solcVersion]) {
        await this.state.downloader.getDownloadedCompilerPath(
          req.body.solcVersion
        )
      }
      this.state.cache[req.body.solcVersion] = true

      return {
        compilerOutput: this.state.compiler.compile({
          solcVersion: req.body.solcVersion,
          compilerInput: req.body.compilerInput,
        }),
      }
    })
  }
}
