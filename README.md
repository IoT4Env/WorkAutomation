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
