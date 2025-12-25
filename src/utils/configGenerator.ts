import type { Machine } from '../types'

export function getEtcdHostIp(machines: Machine[]): string | null {
  for (const machine of machines) {
    if (machine.components) {
      const etcdComp = machine.components.find(c => c.type === 'etcd')
      if (etcdComp) {
        return machine.hostIp
      }
    }
  }
  return null
}

export function getMetasrvHostIp(machines: Machine[]): string | null {
  for (const machine of machines) {
    if (machine.components) {
      const metasrvComp = machine.components.find(c => c.type === 'metasrv')
      if (metasrvComp) {
        return machine.hostIp
      }
    }
  }
  return null
}

export function getMetasrvPort(machines: Machine[]): number {
  // Find the first metasrv and return its port (default 3002, or bumped if multiple on same machine)
  for (const machine of machines) {
    if (machine.components) {
      const metasrvComp = machine.components.find(c => c.type === 'metasrv')
      if (metasrvComp) {
        // First metasrv on this machine uses port 3002
        return 3002
      }
    }
  }
  return 3002
}

export function generateEtcdConfig(machine: Machine): string {
  return `nohup etcd --data-dir=${machine.greptimeHome}/etcd/data > ${machine.greptimeHome}/logs/etcd.log 2>&1 &`
}

export function generateMetasrvConfig(machine: Machine, cardinal: number, machineIndex: number, machines: Machine[]): string {
  const etcdHostIp = getEtcdHostIp(machines) || '$ETCD_HOST_IP'

  // Port bumping: if multiple metasrv on same machine, bump ports
  // First instance: 3002, 3100; Second: 3003, 3110; etc.
  const bindPort = 3002 + machineIndex
  const httpPort = 3100 + machineIndex * 10

  return `cat <<EOF > ${machine.greptimeHome}/config/metasrv-${cardinal}.toml
data_home = "${machine.greptimeHome}/data/metasrv-${cardinal}/"
bind_addr = "0.0.0.0:${bindPort}"
server_addr = "${machine.hostIp}:${bindPort}"
store_addrs = ["${etcdHostIp}:2379"]

[http]
addr = "0.0.0.0:${httpPort}"
backend = "etcd_store"
EOF

greptime metasrv start -c ${machine.greptimeHome}/config/metasrv-${cardinal}.toml`
}

export function generateDatanodeConfig(machine: Machine, cardinal: number, machineIndex: number, machines: Machine[]): string {
  const metasrvHostIp = getMetasrvHostIp(machines) || '$METASRV_HOST_IP'
  const metasrvPort = getMetasrvPort(machines)

  // Port bumping: if multiple datanode on same machine, bump ports
  // First instance: 4200, 4201; Second: 4210, 4211; etc.
  const httpPort = 4200 + machineIndex * 10
  const grpcPort = 4201 + machineIndex * 10

  return `cat <<EOF > ${machine.greptimeHome}/config/datanode-${cardinal}.toml
node_id = ${cardinal}

[http]
addr = "0.0.0.0:${httpPort}"
timeout = "0s"
body_limit = "64MB"


[grpc]
bind_addr = "0.0.0.0:${grpcPort}"
server_addr = "${machine.hostIp}:${grpcPort}"
runtime_size = 8
max_recv_message_size = "512MB"
max_send_message_size = "512MB"
flight_compression = "none"


[meta_client]
metasrv_addrs = ["${metasrvHostIp}:${metasrvPort}"]

[wal]
provider = "raft_engine"
dir = "${machine.greptimeHome}/data/datanode-${cardinal}/wal"
file_size = "128MB"
purge_threshold = "1GB"
sync_write = false
enable_log_recycle = true
prefill_log_files = false
max_batch_bytes = "1MB"


[storage]
# The working home directory.
data_home = "${machine.greptimeHome}/data/datanode-${cardinal}/"
# Storage type.
type = "File"

[logging]
dir = "${machine.greptimeHome}/logs/datanode-${cardinal}/"
EOF

greptime datanode start -c ${machine.greptimeHome}/config/datanode-${cardinal}.toml`
}

export function generateFrontendConfig(machine: Machine, cardinal: number, machineIndex: number, machines: Machine[]): string {
  const metasrvHostIp = getMetasrvHostIp(machines) || '$METASRV_HOST_IP'
  const metasrvPort = getMetasrvPort(machines)

  // Port bumping: if multiple frontend on same machine, bump ports
  // First instance: 4000, 4001, 4002, 4003; Second: 4010, 4011, 4012, 4013; etc.
  const httpPort = 4000 + machineIndex * 10
  const grpcPort = 4001 + machineIndex * 10
  const mysqlPort = 4002 + machineIndex * 10
  const postgresPort = 4003 + machineIndex * 10

  return `cat <<EOF > ${machine.greptimeHome}/config/frontend-${cardinal}.toml
[http]
addr = "0.0.0.0:${httpPort}"
timeout = "0s"
body_limit = "64MB"

[meta_client]
metasrv_addrs = ["${metasrvHostIp}:${metasrvPort}"]

[grpc]
bind_addr = "0.0.0.0:${grpcPort}"
server_addr = "${machine.hostIp}:${grpcPort}"
runtime_size = 8
flight_compression = "none"

[mysql]
addr = "0.0.0.0:${mysqlPort}"
[postgres]
addr = "0.0.0.0:${postgresPort}"

[logging]
dir = "${machine.greptimeHome}/logs/frontend-${cardinal}/"

EOF

greptime frontend start -c ${machine.greptimeHome}/config/frontend-${cardinal}.toml`
}
