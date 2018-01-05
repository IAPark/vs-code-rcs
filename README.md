# RCS

An extension to add basic SCM support for RCS. Experimental and RCS in particular is not recommended

It may also use larger than expected CPU when it first scans a directory. For this reason combined with not getting activation events to work right it's better to keep this disabled by default and only enable it for projects that use RCS

## Features

* list files locked by the user
* list files locked by other users
* show changes as compared to the head.
* commit changes
* automatically prevent edits to locked files and offer to unlock them


## Requirements

You must have the RCS commands installed, in particular ci, co, and rlog are all used

## Why does this exist?

RCS is fairly ancient and in my searching I can't find much evidence of its continued use, so it's a fair question.
I was forced into using it and was interested in learning more about building VS Code extensions. After using it off and on for a 
few months I decided to share.

This also means that it has bugs. Memory leaks are probably the simpliest example. I may go through in the future and streamline the code with an eye towards reducing bugs and reusing it for other SCM providers