# Contitions of use

=================
MIT License

Copyright (c) [2024] [BioTech4Env]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

# Preview: The project

This idea came out from a real world need:
Considering the amount of data a company might have, a simple ods or excel file is simple not enought.
Moreover, when selecting data based on specific requirements (alfabetic order, descending price, etc...), the final visualization can be tedius due to the data scattered around the sheet.

## Project Goal

This solution provides better visualization of the data over all, while garanting large data template storage.
All the information will be saved on-prem (no internet needed), so it will be accessible only from the fisical machine at all time.

## How is this even possible?

The raw data, which came from an ods or excel file, is elaborated from a vbs script (used by ods and excel) that extracts the data and converts it into an SQL query that has to be executed manually onto the batabase.
From there, a NodeJS server is instantiated whith the main page ready to execute all basid CRUD queries.

### Not adaptable for all cases (YET...)

The project with the up-written specification can be found in the main branch of my repository (if you came here, you might already know where it is...).
Future versions of the project will be developed on a separated branch, adding more dinamicity and usability for all potentials StakeHolder that might want to use this SowtWare.
