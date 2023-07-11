import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { HYRequestConfig, HYRequestInterceptors } from './type'
import { ElLoading } from 'element-plus'

class MiniRequest {
  instance: AxiosInstance
  interceptor?: HYRequestInterceptors
  loading?: any
  showLoading: boolean

  constructor(config: HYRequestConfig) {
    this.instance = axios.create(config)
    this.interceptor = config.interceptors
    this.showLoading = config.showLoading ?? false

    // 从config取出的拦截器是对应例子的拦截器
    this.instance.interceptors.request.use(
      this.interceptor?.requestInterceptor,
      this.interceptor?.requestInterceptorCatch
    )

    this.instance.interceptors.response.use(
      this.interceptor?.responseInterceptor,
      this.interceptor?.responseInterceptorCatch
    )

    // 添加所有实例都有的拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // console.log('所有实例都有的拦截器：请求成功拦截器')

        if (this.showLoading) {
          this.loading = ElLoading.service({
            lock: true,
            text: 'Loading',
            background: 'rgba(0, 0, 0, 0.7)'
          })
        }
        return config
      },
      (err) => {
        // console.log('所有实例都有的拦截器：请求失败拦截器')
        return err
      }
    )

    this.instance.interceptors.response.use(
      (res) => {
        // console.log('所有实例都有的拦截器：响应成功拦截器')
        const data = res.data

        // 将loading移除
        this.loading?.close()

        if (data.returnCode === '-1001') {
          console.log('请求失败~，错误信息')
        } else {
          return data
        }
      },
      (err) => {
        // 将loading移除
        this.loading?.close()

        // console.log('所有实例都有的拦截器：响应失败拦截器')
        if (err.response.status === 404) {
          console.log('404错误信息~')
        }
        return err
      }
    )
  }

  request<T>(config: HYRequestConfig<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (config.interceptors?.requestInterceptor) {
        config = config.interceptors.requestInterceptor(config)
      }
      this.instance.request<any, T>(config).then(
        (res) => {
          if (config.interceptors?.responseInterceptor) {
            res = config.interceptors.responseInterceptor(res)
          }
          // console.log(res.data)
          resolve(res)
        },
        (err) => {
          reject(err)
        }
      )
    })
  }

  get<T>(config: HYRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'GET' })
  }

  post<T>(config: HYRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'POST' })
  }

  delete<T>(config: HYRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE' })
  }

  patch<T>(config: HYRequestConfig<T>): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH' })
  }
}

export default MiniRequest
