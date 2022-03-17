from flask import Flask, render_template, request, make_response, redirect, url_for
import git

app = Flask(__name__)

app.secret_key = '\x7f\xb1\xcf\x06\x0f\x00\x87~\xf3\xf3[(Tn\r\xbb\xeb\x0f\x1d\xfc\x9e\x8b\xbbU'

####################################################################################################
# Menu structure
Pages = [
    ['Omrekenen',
        ['Afstanden','Gewicht', 'Data', 'Temperatuur', 'Oppervlakte', 'Inhoud', 'Tijd']
    ],
    ['Berekenen',[
        'Stroom', 'Verhoudingen', 'Inhoud'
        ]
    ]
]
# , 'Inhoud', 'Omtrek'
####################################################################################################
# Functions

def cookies(request, page):
    if request.cookies.get('ID'):
        Cookie = request.cookies.get('ID')
    else:
        Cookie = '[]'
    Cookie = eval(Cookie)

    if page in Cookie:
    	Cookie.remove(page)
    Cookie.insert(0, page)
    del Cookie[5:]

    resp = make_response(render_template(page+'.html', Cookie=Cookie))
    resp.set_cookie('ID', str(Cookie))
    return resp

####################################################################################################
# Give menu data to all pages
@app.context_processor
def get_pages():
  return {"Pages": Pages}

####################################################################################################
# Main pages
@app.route('/webhook', methods=['POST'])
def webhook():
    if request.method == 'POST':
        repo = git.Repo('.')
        origin = repo.remotes.origin
        repo.create_head('master',
    origin.refs.master).set_tracking_branch(origin.refs.master).checkout()
        origin.pull()
        return '', 200
    else:
        return '', 400

@app.route('/')
def Home():
    return render_template('Homepage.html')

@app.route('/Omrekenen')
def Omrekenen():
    return render_template('Omrekenen.html')

@app.route('/Berekenen')
def Berekenen():
    return render_template('Berekenen.html')

####################################################################################################
# Omrekenen

@app.route('/Omrekenen/<pagina>')
def Omrekenen_pagina(pagina):
    try:
        return  cookies(request, '/Omrekenen/{}'.format(pagina))
    except:
        return redirect(url_for('Omrekenen'))

####################################################################################################
# Berekenen

@app.route('/Berekenen/<pagina>')
def Berekenen_pagina(pagina):
    try:
        return cookies(request, '/Berekenen/{}'.format(pagina))
    except:
        return redirect(url_for('Berekenen'))

####################################################################################################