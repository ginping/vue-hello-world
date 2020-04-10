<template>
  <div>
    <input type="file" @change="handleFileChange">
    <el-button @click="handleUpload">上传</el-button>
  </div>
</template>

<script>
import { ping, uploadFile, mergeFile } from '@/api/upload' // eslint-disable-line

const SIZE = 10 * 1024 * 1024 // 切片大小, 单位 B

export default {
  data: () => ({
    container: {
      file: null
    },
    data: []
  }),
  methods: {
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      Object.assign(this.$data, this.$options.data())
      this.container.file = file
    },
    // 生成切片文件
    createFileChunk(file, size = SIZE) {
      const fileChunkList = []
      let cur = 0
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) })
        cur += size
      }
      return fileChunkList
    },
    // 上传切片
    async uploadChunks() {
      const requestList = this.data
        .map(({ chunk, hash }) => {
          const formData = new FormData()
          formData.append('chunk', chunk)
          formData.append('hash', hash)
          formData.append('filename', this.container.file.name)
          return { formData }
        })
        .map(async({ formData }) => uploadFile(formData))
      await Promise.all(requestList) // 并发切片
      await mergeFile({ filename: this.container.file.name })
    },
    async handleUpload() {
      this.ping()
      if (!this.container.file) return
      const fileChunkList = this.createFileChunk(this.container.file)
      this.data = fileChunkList.map(({ file }, index) => {
        return { chunk: file, hash: this.container.file.name + '-' + index }
      })
      await this.uploadChunks()
    },
    ping() {
      ping().then(response => {
        const pong = response.data
        console.log('ping', pong)
      })
    }
  }
}
</script>
