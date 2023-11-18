import { eventHandler } from 'h3'
import { split } from 'shamirs-secret-sharing-ts'

export default eventHandler(event => {
  const privateKey = event.context.params?._ ?? ''

  return split(Buffer.from(privateKey), { shares: 3, threshold: 2 })
})
