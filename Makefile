run-debug:
	flask --debug run
run-demo:
	gunicorn3 -e SCRIPT_NAME=/hackaday/experiment --bind 0.0.0.0:8025 app:app
