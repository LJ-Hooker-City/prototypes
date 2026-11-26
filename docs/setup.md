# Setup (Windows)

This guide gets the project onto your computer and starts Codex, the AI agent you'll talk to. You only need to do it once. It takes about 15 minutes.

## How to copy and paste the commands

Each grey box below holds one command. To run it:

1. Hover over the box and click the **copy button** (two overlapping squares) at its top-right corner.
2. Click inside the PowerShell window.
3. Paste with **Ctrl + V** (or right-click), then press **Enter**.
4. Wait until the line ending in `>` comes back before running the next command.

Run the commands one at a time, in order.

## 1. Open PowerShell

PowerShell is a window where you type (or paste) commands for your computer.

1. Press the **Windows key** on your keyboard (or click the Start button).
2. Type **PowerShell**.
3. Click **Windows PowerShell** (or **Terminal**, if that's what you see) in the results.

A window opens with a line that looks something like this:

```text
PS C:\Users\YourName>
```

That's where you paste commands. You don't need to run it "as administrator".

## 2. Install Node.js and Git

Node.js lets you run Codex. Git downloads the project and keeps track of changes.

Install Node.js:

```powershell
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
```

Install Git:

```powershell
winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
```

If Windows asks **"Do you want to allow this app to make changes to your device?"**, click **Yes**.

Allow PowerShell to run the tools you just installed (type `Y` and press Enter if it asks you to confirm):

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Now close PowerShell** (click the X) **and open it again** the same way as in step 1. A fresh window is needed so it notices the new programs.

## 3. Install Codex

```powershell
npm install -g @openai/codex
```

Check it worked. This should print a version number:

```powershell
codex --version
```

## 4. Get the project

Go to your Documents folder:

```powershell
cd ~\Documents
```

Download the project. If a window pops up asking you to sign in to GitHub, click **Sign in with your browser** and log in:

```powershell
git clone https://github.com/LJ-Hooker-City/prototypes.git
```

Go into the project folder:

```powershell
cd prototypes
```

Tell Git your name and email, so your changes are labelled as yours. **Change the text inside the quotes before pressing Enter**: paste the command, use the arrow keys to move back, and type your own details.

```powershell
git config user.name "Your Name"
```

```powershell
git config user.email "your-github-email@example.com"
```

The project now lives in **Documents\prototypes**. You can open that folder in File Explorer and double-click `index.html` to see it in your browser.

## 5. Start Codex

Codex must be started from inside the project folder. If you've just finished step 4, you're already there, so run:

```powershell
codex
```

The first time it runs, Codex asks you to sign in with ChatGPT (this needs a paid plan) or to paste an OpenAI API key.

Codex reads the project's `AGENTS.md` by itself, so it follows the same rules as any other AI agent working on this project. Type what you'd like in plain English and press Enter. See the [README](../README.md) for ideas.

## Next time

You don't need to install anything again. Open PowerShell (step 1), then run these two commands:

```powershell
cd ~\Documents\prototypes
```

```powershell
codex
```

To leave Codex, type `/quit` and press Enter, or just close the window.

## If something goes wrong

- **"winget is not recognized"**: open the **Microsoft Store**, search for **App Installer**, install or update it, then reopen PowerShell.
- **"npm is not recognized"** or **"codex is not recognized"**: close PowerShell and open a new window. If it still happens, restart your computer.
- **"running scripts is disabled on this system"**: run the `Set-ExecutionPolicy` command from step 2 again, then try once more.
- **"destination path 'prototypes' already exists"**: you've already downloaded the project. Skip to `cd prototypes`.
- **Paste doesn't work**: right-click inside the PowerShell window instead of pressing Ctrl + V.
