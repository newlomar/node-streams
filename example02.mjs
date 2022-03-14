import { pipeline, Readable, Writable, Transform } from 'stream'
import { promisify } from 'util'
import { createWriteStream } from 'fs'

const pipelineAsync = promisify(pipeline)

{
  const readableStream = Readable({
    read: function () {

      this.push('Hello Dude!!0')
      this.push('Hello Dude!!1')
      this.push('Hello Dude!!2')
      //avisa que acabaram os dados
      this.push(null)
    }
  })

  const writableStream = Writable({
    write (chunk, encoding, cb) {
      console.log('msg', chunk.toString())
      cb()
    }
  })

  await pipelineAsync(
    readableStream,
    // process.stdout
    writableStream
  )

  console.log('processo 01 acabou!')
}

{

  const readableStream = Readable({
    read ( ) {
      for ( let index = 0; index < 1e5; index++) {
        const person = { id: Date.now() + index, name: `Newton-${index}\n`}
        const data = JSON.stringify(person)
        this.push(data)
      }
      //avisa que acabaram os dados
      this.push(null)
    }
  })


  const writableMapToCSV = Transform({
    transform(chunk, encoding, cb) {
      const data = JSON.parse(chunk)
      const result = `${data.id}, ${data.name.toUpperCase()}`

      cb(null, result)
    }
  })

  const setHeader = Transform({
    transform(chunk, encoding, cb) {
      this.counter = this.counter ?? 0

      if (this.counter) {
        return cb(null, chunk)
      }

      this.counter += 1

      cb(null, "id,name\n".concat(chunk))
    }
  })

  await pipelineAsync(
    readableStream,
    writableMapToCSV,
    setHeader,
    // process.stdout
    createWriteStream('my.csv')
  )
}