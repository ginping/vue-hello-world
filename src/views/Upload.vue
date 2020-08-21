<template>
  <div>
    <input
      type="file"
      :disable="status !== Status.wait"
      @change="handleFileChange"
    >
    <el-button @click="handleUpload">上传</el-button>
    <div>
      <div>计算文件 hash, 乱入一个name: {{ container.arr[2].name }}</div>
      <el-progress :percentage="hashPercentage" />
      <div>总进度</div>
      <el-progress :percentage="fakeUploadPercentage" />
    </div>
    <el-table :data="data">
      <el-table-column
        prop="hash"
        label="切片hash"
        align="center"
      />
      <el-table-column label="大小(KB)" align="center" width="120">
        <template v-slot="{ row }">
          {{ row.size | transformByte }}
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center">
        <template v-slot="{ row }">
          <el-progress
            :percentage="row.percentage"
            color="#909399"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { ping, uploadFile, mergeFile, verifyFile } from '@/api/upload' // eslint-disable-line
import request from '@/utils/request'

const SIZE = 10 * 1024 * 1024 // 切片大小, 单位 B
const Status = {
  wait: 'wait',
  pause: 'pause',
  uploading: 'uploading'
}

export default {
  filters: {
    transformByte(val) {
      return Number((val / 1024).toFixed(0))
    }
  },
  data() {
    return {
      set: new Set(),
      Status,
      container: {
        file: null,
        hash: '',
        worker: null,
        arr: [1, 2, { name: 'vue' }]
      },
      hashPercentage: 0,
      data: [],
      requestList: [],
      status: Status.wait,
      fakeUploadPercentage: 0
    }
  },
  computed: {
    uploadDisabled() {
      return (
        !this.container.file ||
        [Status.pause, Status.uploading].includes(this.status)
      )
    },
    uploadPercentage() {
      if (!this.container.file || !this.data.length) return 0
      const loaded = this.data
        .map(item => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur)
      return parseInt((loaded / this.container.file.size).toFixed(2))
    }
  },
  watch: {
    uploadPercentage(now) {
      if (now > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = now
      }
    }
  },
  created() {
    console.log(this.container)
  },
  methods: {
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
    // 生成文件 hash (web-worker)
    calculateHash(fileChunkList) {
      return new Promise(resolve => {
        this.container.worker = new Worker('/hash.js')
        this.container.worker.postMessage({ fileChunkList })
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data
          this.hashPercentage = percentage
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      Object.assign(this.$data, this.$options.data())
      this.container.file = file
    },
    async handleUpload() {
      this.container.arr[2].name += 'vue'
      if (this.container.arr[2].name) return
      if (!this.container.file) return
      this.status = Status.uploading
      const fileChunkList = this.createFileChunk(this.container.file)
      this.container.hash = await this.calculateHash(fileChunkList)
      const { shouldUpload, uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      )
      if (!shouldUpload) {
        this.$message.success('秒传：上传成功')
        this.status = Status.wait
        return
      }
      this.data = fileChunkList.map(({ file }, index) => ({
        fileHash: this.container.hash,
        index,
        hash: this.container.hash + '-' + index,
        chunk: file,
        size: file.size,
        percentage: uploadedList.includes(this.container.hash + '-' + index) ? 100 : 0
      })
      )
      await this.uploadChunks(uploadedList)
    },
    // 上传切片
    async uploadChunks(uploadedList = []) {
      const requestList = this.data
        .filter(({ hash }) => !uploadedList.includes(hash))
        .map(({ chunk, hash, index }) => {
          const formData = new FormData()
          formData.append('chunk', chunk)
          formData.append('hash', hash)
          formData.append('filename', this.container.file.name)
          formData.append('fileHash', this.container.hash)
          return { formData, index }
        })
        .map(async({ formData, index }) =>
          request({
            url: '/file/upload',
            method: 'post',
            data: formData,
            headers: { 'Content-Type': 'multipart/formdata' },
            onUploadProgress: this.createProgressHandler(this.data[index])
          }))
      await Promise.all(requestList) // 并发切片
      // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时
      if (uploadedList.length + requestList.length === this.data.length) {
        await this.mergeRequest()
      }
    },
    // 通知服务端合并切片
    async mergeRequest() {
      await mergeFile({
        size: SIZE,
        fileHash: this.container.hash,
        filename: this.container.file.name
      })
      this.$message.success('上传成功')
      this.status = Status.wait
    },
    // 根据 hash 验证文件是否曾经已经被上传过
    // 没有才进行上传
    async verifyUpload(filename, fileHash) {
      const { data } = await verifyFile({ filename, fileHash })
      return data
    },
    // 用闭包保存每个 chunk 的进度数据
    createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100))
      }
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
