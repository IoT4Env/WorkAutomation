on Error Resume Next

set fso = CreateObject("Scripting.FileSystemObject")


set objServiceManager = WScript.CreateObject("com.sun.star.ServiceManager")
set starDesktop = objServiceManager.createInstance("com.sun.star.frame.Desktop")
Dim args(0)
cUrl = InputBox("Provide full ods file path")

If fso.GetExtensionName(cUrl) <> "ods" Then
	MsgBox "Invalid file: " & fso.GetExtensionName(cUrl)
	WScript.Quit
End If

cUrl = "file:///" & cUrl
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

query = "INSERT INTO Modelli(Id, Nome, Cognome, Indirizzo, Posta) VALUES " & vbCr & "("

For i = 1 to 6 Step 1
	values = ""
	For j = 1 to 5 Step 1
		set oCell = oSheet.getCellByPosition(j, i)
		value = oCell.getString()
		if IsNumeric(value) Then
			values = values & oCell.getString()
		Else
			values = values & """" & oCell.getString() & """" 
		End if

		If j <> 5 Then
			values = values & ","
		Elseif i = 6 Then
			values = values & ");"
		Else
			values = values & ")," & vbCr & "("
		End	If
	Next
	query = query & values
Next

oDestinationFile.Write query
oDestinationFile.Close

MsgBox "Done"
