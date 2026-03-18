# funny core game
roblox game about a reactor
## How to contribute

This is how you can setup a dev enviroment and start developing

### Prerequisites
- [**Git**](https://git-scm.com/downloads)
- [**Node.js**](https://nodejs.org/)
### Installation
1. **Clone the Repo**
    ```bash
    git clone https://github.com/12354fdw/fcg.git
    cd fcg
    ```
2. **Install Dependencies**
	```bash
	npm install
	```
3. **Install Rokit** 
    - **Linux / macOS:**

        ```bash
        curl -sSf https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.sh | bash
        ```

    - **Windows (PowerShell as ADMIN):**

        ```powershell
        Invoke-RestMethod https://raw.githubusercontent.com/rojo-rbx/rokit/main/scripts/install.ps1 | Invoke-Expression
        ```
4. **Start dev server** This starts everything you need (TypeScript compiler, Rojo, etc.)
	```bash
	npm run dev
	```
