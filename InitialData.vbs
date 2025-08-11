on Error Resume Next

set fso = CreateObject("Scripting.FileSystemObject")


set objServiceManager = WScript.CreateObject("com.sun.star.ServiceManager")
set starDesktop = objServiceManager.createInstance("com.sun.star.frame.Desktop")
Dim args(0)
cUrl = "file:///C:\Users\Utente\Documents\AutomationScripts\WorkAutomation\contentFile.ods"
set args(0) = objServiceManager.Bridge_GetStruct("com.sun.star.beans.PropertyValue")
Set args(0).Name = "Hidden"
args(0).Value = true
set oDocument = starDesktop.loadComponentFromURL(cUrl, "_blank", 0, args)
set oSheet = oDocument.getSheets().getByIndex(0)

set oDestinationFile = fso.OpenTextFile(".\destinationFile.sql",2)

'We will convert all data in a json file in some way...
' header = Array("Id", "Nome", "Cognome", "Indirizzo", "Posta")
' json = "["
' for i = 1 to 6 Step 1
' 	json = json & "{"
' 	for j = 1 to 5 Step 1
' 		set oCell = oSheet.getCellByPosition(j, i)
' 		json = json & """" &  header(j - 1) & """: "
' 		value = oCell.getString()
' 		if IsNumeric(value) Then
' 			json = json & oCell.getString()
' 		Else
' 			json = json & """" & oCell.getString() & """"
' 		end If
' 		json = json & ","
' 	Next
' 	json = json & "}" & ","
' Next
' json = json & "]"
' oDestinationFile.Write json

For i = 1 to 6 Step 1
	query = vbCr & "INSERT INTO Modelli(Id, Nome, Cognome, Indirizzo, Posta) VALUES ("
	For j = 1 to 5 Step 1
		set oCell = oSheet.getCellByPosition(j, i)
		value = oCell.getString()
		if IsNumeric(value) Then
			query = query & oCell.getString()
		Else
			query = query & "'" & oCell.getString() & "'"
		end if
		If j <> 5 Then
			query = query & ", "
		Else
			query = query & ");"
		end	If
	Next
	oDestinationFile.Write query
Next

oDestinationFile.Close

MsgBox "Done"
