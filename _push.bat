@echo off
cd /d "c:\Users\Akanksha\Downloads\dating-app-api-main\dating-app-api-main"
echo === RUN AT %DATE% %TIME% === > _git_output.txt
echo === GIT STATUS === >> _git_output.txt
git status >> _git_output.txt 2>&1
echo === GIT ADD === >> _git_output.txt
git add -A >> _git_output.txt 2>&1
echo === GIT COMMIT === >> _git_output.txt
git commit -m "Fix: Parameter order mismatches in all shop services" >> _git_output.txt 2>&1
echo === GIT PUSH === >> _git_output.txt
git push origin main >> _git_output.txt 2>&1
echo === DONE === >> _git_output.txt
