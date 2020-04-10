import request from '@/utils/request'

export function ping() {
  return request({
    url: '/ping',
    method: 'get'
  })
}

export function uploadFile(data) {
  return request({
    url: '/file/upload',
    method: 'post',
    data,
    headers: { 'Content-type': 'multipart/formdata' }
  })
}

export function mergeFile(data) {
  return request({
    url: '/merge',
    method: 'post',
    data
  })
}
