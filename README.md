## GreptimeDB Deploy Helper (Web UI)

An interactive, single-page web app to **design and generate deployment commands** for a GreptimeDB cluster.

Open `index.html` in a browser and you can:

- **Add physical machines** and specify:
  - `HOST_IP`
  - `GREPTIME_HOME` (e.g. `/opt/greptimedb`)
- **Drag components** onto machines:
  - `etcd`
  - `metasrv`
  - `datanode`
  - `frontend`
- The app enforces a valid cluster:
  - At least 1 `etcd`, 1 `metasrv`, 1 `datanode`, 1 `frontend`
- **Generate commands** and per-component config snippets with:
  - Correct `HOST_IP` / `GREPTIME_HOME`
  - Port bumping when multiple instances live on the same machine
  - Proper wiring between:
    - `metasrv` ↔ `etcd`
    - `datanode` / `frontend` ↔ `metasrv`

The UI then shows **one command block per component instance**, each with:

- A **highlighted instruction box**:
  - `Step N: Deploy <component> on <HOST_IP> (Machine X, GREPTIME_HOME=..., instance #k)`
- A **syntax‑highlighted bash block** containing the actual commands
- A centered **“Copy This Block”** button

You can execute each block on the specified machine in the given order:

1. All `etcd` instances
2. All `metasrv` instances
3. All `datanode` instances
4. All `frontend` instances

### Running the app

No build or backend is required; it is a pure HTML/JS page:

```bash
cd /solidigm/greptimedb-deploy-helper
xdg-open index.html  # or open index.html in your browser
```

Any modern browser should work (Chrome, Firefox, Edge, Safari).

### Notes

- Component **cardinals start from 0**:
  - `metasrv-0.toml`, `datanode-0.toml`, etc.
  - `node_id` in datanode configs is 0‑based as well.
- Ports are automatically bumped per machine when you place multiple instances of the same component on that machine.
- Configs and commands are generated based on the GreptimeDB examples you provided for:
  - `etcd`
  - `metasrv`
  - `datanode`
  - `frontend`

