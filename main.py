import importlib.util

spec = importlib.util.spec_from_file_location("fraud", "fraud-ml.py")
fraud_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fraud_module)

app = fraud_module.app
