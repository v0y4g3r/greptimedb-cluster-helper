export interface Component {
  type: 'etcd' | 'metasrv' | 'datanode' | 'frontend'
  count: number
}

export interface Machine {
  id: number
  hostIp: string
  greptimeHome: string
  components?: Component[]
}

export interface GeneratedConfig {
  text: string
  type: Component['type']
  machineId: number
  hostIp: string
  greptimeHome: string
  cardinal: number
  step: number
}

export interface Message {
  text: string
  type: 'info' | 'error' | 'warning' | 'success'
}