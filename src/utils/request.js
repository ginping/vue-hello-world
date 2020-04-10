import axios from 'axios'

const service = axios.create({
  timeout: 24000
})

export default service
