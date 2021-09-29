STACKNAME := FirstCallStack
LAMBDALOG := $(shell jq .FirstCallStack.firstCallLambdaLog cdk-outputs.json)

deploy:
	cdk deploy --outputs-file ./cdk-outputs.json


logs:
	aws logs tail $(LAMBDALOG) --follow 

clean:
	-rm *~
	-rm cdk-outputs.json

watch:
	saw watch $(LAMBDALOG) --filter INFO --expand
