import importlib
import json
import os
import shutil
from keras import backend as K
from flask import Flask, request
import sys
import requests
from flask_cors import CORS
import tensorflow as tf

sys.path.append("./")
sys.path.append("../")

import models.settings as S

app = Flask(__name__)
# app.debug = True
CORS(app)


def safe_mkdir(path):
    try:
        os.mkdir(path)
    except OSError:
        pass


def cach_dicoms(info):
    url = "http://pca-finder.staging.rcc.uchicago.edu:8042/"
    if info["case"] not in os.listdir(S.dicom_folder):
        patient_folder = os.path.join(S.dicom_folder, info["case"])
        safe_mkdir(patient_folder)
        post_query = {"Level": "Instance", "Query": {"PatientName": info["case"]}}
        response = requests.post(url + "tools/find", data=json.dumps(post_query),
                                 auth=("**", "**"))
        for enum, instance_id in enumerate(response.json()):
            dicom = requests.get(url + "/instances/" + str(instance_id) + "/file",
                                 stream=True,
                                 auth=("**", "**"))
            with open(os.path.join(patient_folder, str(enum)), 'wb') as out_file:
                shutil.copyfileobj(dicom.raw, out_file)
            del dicom
        print("*" * 100)
        print(response.json()[0])


model_uid_1 = "Densenet_T2_ABK_auc_08"
model_uid_2 = "Densenet_T2_ABK_auc_079_nozone"
model_uid_3 = "CNN3D"
deployer1 = importlib.import_module(model_uid_1 + ".deploy").Deploy()
model1 = deployer1.build()
model1._make_predict_function()
# graph=tf.get_default_graph()
deployer2 = importlib.import_module(model_uid_2 + ".deploy").Deploy()
model2 = deployer2.build()
model2._make_predict_function()

deployer3 = importlib.import_module(model_uid_3 + ".deploy").Deploy()
model3 = deployer3.build()
model3._make_predict_function()


@app.route('/predict', methods=['GET'])
def predict():
    global model1, model2
    global deployer1, deployer2
    info = request.args.to_dict()
    info["lps"] = list(map(float, [info["lps_x"], info["lps_y"], info["lps_z"]]))
    # cach_dicoms(info)
    result = "NA"
    if info["model_name"] == model_uid_1:
        result = deployer1.run(model1, info)
    elif info["model_name"] == model_uid_2:
        result = deployer2.run(model2, info)
	elif info["model_name"] == model_uid_3:
        result = deployer3.run(model3, info)
    return result


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)