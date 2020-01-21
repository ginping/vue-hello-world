<template>
  <div>
    <input type="file" @change="handleFileChange">
    <el-button @click="handleUpload">上传</el-button>
  </div>
</template>

<script>
export default {
  data: () => ({
    container: {
      file: null
    }
  }),
  methods: {
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      this.container.file = file
    },
    async handleUpload() {
      console.log('wait to upload')
    }
  }
}
</script>
