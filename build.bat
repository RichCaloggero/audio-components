@echo off
cd demo
echo "building demo:"
call polymer build
echo "done."

cd ..\editor
echo "building editor:"
call polymer build
echo "done."
cd ..

