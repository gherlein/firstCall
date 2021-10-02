STACKNAME := FirstCallStack
LAMBDALOG := $(shell jq .FirstCallStack.firstCallLambdaLog cdk-outputs.json)
LAMBDAARN := $(shell jq .FirstCallStack.firstCallLambdaARN cdk-outputs.json)

IN_EVENT  := ./test/in.json
OUT_JSON  := ./out/out.json

deploy:
	cdk deploy --outputs-file ./cdk-outputs.json


logs:
	aws logs tail $(LAMBDALOG) --follow --format short --filter-pattern INFO

clean:
	-rm *~
	-rm cdk-outputs.json

watch:
	saw watch $(LAMBDALOG) --filter INFO --expand

invoke:
	jq . ${IN_EVENT}
	aws lambda invoke --function-name ${LAMBDAARN} --cli-binary-format raw-in-base64-out --payload file://${IN_EVENT} ${OUT_JSON}
	jq . ${OUT_JSON}