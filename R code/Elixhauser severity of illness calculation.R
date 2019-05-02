library(readxl)
library(comorbidity)


ICD9=read_excel("~/Hosp Data/2008-2015 codes.xlsx")
ICD10=read_excel("~/Hosp Data/2015-2018 codes.xlsx")

ICD9= comorbidity(x = ICD9, id = "account", code = "Value", score = "elixhauser", icd = "icd9")
ICD10= comorbidity(x = ICD10, id = "account", code = "Value", score = "elixhauser", icd = "icd10")
                   
write.csv(ICD9,"ICD9.csv")
write.csv(ICD10,"ICD10.csv")