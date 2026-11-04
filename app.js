
let db = JSON.parse(localStorage.getItem('registro_ore_db')) || {
    nomeOperaio: "Operaio Non Specificato",
    clienti: [],
    rapportini: []
};

let annoSelezionato = new Date().getFullYear();
let meseSelezionato = new Date().getMonth();
let tipologiaAttuale = "LAVORO";
let oreSelezionate = 8.0;
let clienteCorrenteId = null;
let cantiereCorrenteId = null;

function salvaDB() {
    localStorage.setItem('registro_ore_db', JSON.stringify(db));
    renderTutto();
}

function renderTutto() {
    document.getElementById('nomeOperaioDisplay').innerText = db.nomeOperaio;
    renderAnagrafica();
    renderCompilaSelects();
    renderPlancia();
}

function cambiaTab(index, el) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    if(index === 0) document.getElementById('tab-anagrafica').classList.add('active');
    if(index === 1) document.getElementById('tab-compila').classList.add('active');
    if(index === 2) { document.getElementById('tab-plancia').classList.add('active'); renderPlancia(); }
    el.classList.add('active');
}

function renderAnagrafica() {
    const container = document.getElementById('listaClienti');
    container.innerHTML = '';
    if(db.clienti.length === 0) {
        container.innerHTML = '<p class="text-sm" style="text-align:center; padding: 20px;">Nessun cliente registrato.</p>';
        return;
    }
    db.clienti.forEach(cl => {
        const card = document.createElement('div');
        card.className = 'card';
        let cantieriHtml = '';
        cl.cantieri.forEach(ca => {
            const chiuso = ca.stato === 'CHIUSO';
            let interniHtml = '';
            ca.interni.forEach(inr => {
                interniHtml += `<div class="flex-between" style="padding: 4px 0; font-size:13px; color: ${chiuso?'gray':'var(--text-main)'}">
                    <span>• ${inr.codice}</span>
                    ${chiuso?'':`<span style="cursor:pointer; color:var(--danger); padding: 4px 8px;" onclick="eliminaInterno('${cl.id}','${ca.id}','${inr.id}')">✕</span>`}
                </div>`;
            });
            cantieriHtml += `<div style="margin-left: 16px; margin-top: 8px; border-left: 2px solid var(--surface-variant); padding-left: 10px;">
                <div class="flex-between">
                    <span style="font-weight: 500; color: ${chiuso?'gray':'var(--text-main)'};">${ca.nome} ${chiuso?'(CHIUSO)':''}</span>
                    <div>
                        ${chiuso ? 
                            `<span style="cursor:pointer; color:var(--secondary); font-size:12px; margin-right:8px; padding: 4px;" onclick="toggleCantiere('${cl.id}','${ca.id}','ATTIVO')">Riapri</span>` :
                            `<span style="cursor:pointer; color:var(--primary); font-size:12px; margin-right:8px; padding: 4px;" onclick="apriModalInterno('${cl.id}','${ca.id}')">+Int</span>
                             <span style="cursor:pointer; color:var(--secondary); font-size:12px; margin-right:8px; padding: 4px;" onclick="apriModalMassivo('${cl.id}','${ca.id}')">Massivo</span>
                             <span style="cursor:pointer; color:var(--danger); font-size:12px; padding: 4px;" onclick="toggleCantiere('${cl.id}','${ca.id}','CHIUSO')">Chiudi</span>`
                        }
                    </div>
                </div>
                <div style="margin-top:4px;">${interniHtml || '<span class="text-sm">Nessun interno</span>'}</div>
            </div>`;
        });

        card.innerHTML = `
            <div class="flex-between">
                <strong>${cl.nome}</strong>
                <div>
                    <span style="cursor:pointer; color:var(--secondary); margin-right:12px; padding: 4px;" onclick="apriModalCantiere('${cl.id}')">+ Cantiere</span>
                    <span style="cursor:pointer; color:var(--danger); padding: 4px;" onclick="eliminaCliente('${cl.id}')">Elimina</span>
                </div>
            </div>
            <div style="margin-top: 8px;">${cantieriHtml || '<span class="text-sm">Nessun cantiere</span>'}</div>
        `;
        container.appendChild(card);
    });
}

function mostraModalCliente(mostra) { document.getElementById('modalCliente').style.display = mostra ? 'flex' : 'none'; }
function salvaNuovoCliente() {
    const nome = document.getElementById('nomeNuovoClienteInput').value.trim();
    if(nome) {
        db.clienti.push({ id: 'cl_' + Date.now(), nome: nome, cantieri: [] });
        document.getElementById('nomeNuovoClienteInput').value = '';
        mostraModalCliente(false);
        salvaDB();
    }
}
function eliminaCliente(id) {
    if(confirm("Eliminare cliente e tutti i dati associati?")) {
        db.clienti = db.clienti.filter(c => c.id !== id);
        db.rapportini = db.rapportini.filter(r => r.clienteId !== id);
        salvaDB();
    }
}
function apriModalCantiere(clId) { clienteCorrenteId = clId; document.getElementById('modalCantiere').style.display = 'flex'; }
function salvaNuovoCantiere() {
    const nome = document.getElementById('nomeNuovoCantiereInput').value.trim();
    if(nome && clienteCorrenteId) {
        const cl = db.clienti.find(c => c.id === clienteCorrenteId);
        if(cl) cl.cantieri.push({ id: 'ca_' + Date.now(), nome: nome, interni: [], stato: 'ATTIVO' });
        document.getElementById('nomeNuovoCantiereInput').value = '';
        chiudiModali();
        salvaDB();
    }
}
function toggleCantiere(clId, caId, stato) {
    const cl = db.clienti.find(c => c.id === clId);
    if(cl) { const ca = cl.cantieri.find(c => c.id === caId); if(ca) ca.stato = stato; }
    salvaDB();
}
function apriModalInterno(clId, caId) { clienteCorrenteId = clId; cantiereCorrenteId = caId; document.getElementById('modalInterno').style.display = 'flex'; }
function salvaNuovoInterno() {
    const codice = document.getElementById('codiceInternoInput').value.trim();
    if(codice && clienteCorrenteId && cantiereCorrenteId) {
        const cl = db.clienti.find(c => c.id === clienteCorrenteId);
        const ca = cl?.cantieri.find(c => c.id === cantiereCorrenteId);
        if(ca) ca.interni.push({ id: 'in_' + Date.now(), codice: codice });
        document.getElementById('codiceInternoInput').value = '';
        chiudiModali();
        salvaDB();
    }
}
function eliminaInterno(clId, caId, inId) {
    const cl = db.clienti.find(c => c.id === clId);
    const ca = cl?.cantieri.find(c => c.id === caId);
    if(ca) ca.interni = ca.interni.filter(i => i.id !== inId);
    salvaDB();
}
function apriModalMassivo(clId, caId) { clienteCorrenteId = clId; cantiereCorrenteId = caId; document.getElementById('modalMassivo').style.display = 'flex'; }
function eseguiGeneratoreMassivo() {
    const pref = document.getElementById('massivoPrefisso').value;
    const da = parseInt(document.getElementById('massivoDa').value) || 1;
    const a = parseInt(document.getElementById('massivoA').value) || 1;
    const cl = db.clienti.find(c => c.id === clienteCorrenteId);
    const ca = cl?.cantieri.find(c => c.id === cantiereCorrenteId);
    if(ca) {
        for(let i=da; i<=a; i++) {
            ca.interni.push({ id: 'in_' + Date.now() + '_' + i, codice: `${pref} ${i}` });
        }
    }
    chiudiModali();
    salvaDB();
}
function chiudiModali() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

document.getElementById('dataRapportino').valueAsDate = new Date();

function selezionaTipologia(tipo) {
    tipologiaAttuale = tipo;
    document.querySelectorAll('#chipsTipologia .chip').forEach(c => {
        c.classList.toggle('selected', c.innerText === tipo);
    });
    document.getElementById('campiLavoro').style.display = tipo === 'LAVORO' ? 'block' : 'none';
    document.getElementById('campoSpese').style.display = tipo === 'LAVORO' ? 'block' : 'none';
    if(tipo !== 'LAVORO') {
        oreSelezionate = 8.0;
        document.getElementById('inputNote').value = `Giornata di ${tipo}`;
    } else {
        document.getElementById('inputNote').value = '';
    }
    aggiornaUIlOre();
}

function renderCompilaSelects() {
    const selCl = document.getElementById('selectCliente');
    const valCl = selCl.value;
    selCl.innerHTML = '<option value="">Seleziona Cliente *</option>';
    db.clienti.forEach(cl => {
        selCl.innerHTML += `<option value="${cl.id}">${cl.nome}</option>`;
    });
    if(valCl) selCl.value = valCl;
    aggiornaCantieri();
    renderFrequenti();
}

function aggiornaCantieri() {
    const clId = document.getElementById('selectCliente').value;
    const selCa = document.getElementById('selectCantiere');
    selCa.innerHTML = '<option value="">Seleziona Cantiere *</option>';
    const cl = db.clienti.find(c => c.id === clId);
    if(cl) {
        cl.cantieri.filter(c => c.stato === 'ATTIVO').forEach(ca => {
            selCa.innerHTML += `<option value="${ca.id}">${ca.nome}</option>`;
        });
    }
    aggiornaInterni();
}

function aggiornaInterni() {
    const clId = document.getElementById('selectCliente').value;
    const caId = document.getElementById('selectCantiere').value;
    const selIn = document.getElementById('selectInterno');
    selIn.innerHTML = '<option value="">Nessun Interno</option>';
    const cl = db.clienti.find(c => c.id === clId);
    const ca = cl?.cantieri.find(c => c.id === caId);
    if(ca) {
        ca.interni.forEach(inr => {
            selIn.innerHTML += `<option value="${inr.id}">${inr.codice}</option>`;
        });
    }
}

function aggiungiOre(v) {
    if(oreSelezionate + v >= 0.5) oreSelezionate += v;
    aggiornaUIlOre();
}
function impostaOre(v) {
    oreSelezionate = v;
    aggiornaUIlOre();
}
function aggiornaUIlOre() {
    document.getElementById('oreLabel').innerText = oreSelezionate + 'h';
}

function renderFrequenti() {
    const container = document.getElementById('chipsFrequenti');
    const box = document.getElementById('boxFrequenti');
    container.innerHTML = '';
    const lavoroRaps = db.rapportini.filter(r => r.tipologia === 'LAVORO').slice(-30).reverse();
    const unici = [];
    lavoroRaps.forEach(r => {
        const key = `${r.clienteId}_${r.cantiereId}_${r.internoId || ''}`;
        if(!unici.includes(key) && unici.length < 3) {
            unici.push(key);
            const cl = db.clienti.find(c => c.id === r.clienteId);
            const ca = cl?.cantieri.find(c => c.id === r.cantiereId);
            if(cl && ca) {
                const chip = document.createElement('div');
                chip.className = 'chip';
                chip.innerText = `${ca.nome} ${r.internoCodice || ''}`;
                chip.onclick = () => {
                    document.getElementById('selectCliente').value = cl.id;
                    aggiornaCantieri();
                    document.getElementById('selectCantiere').value = ca.id;
                    aggiornaInterni();
                    if(r.internoId) document.getElementById('selectInterno').value = r.internoId;
                };
                container.appendChild(chip);
            }
        }
    });
    box.style.display = unici.length > 0 ? 'block' : 'none';
}

function copiaUltimoRapportino() {
    const ultimo = db.rapportini[db.rapportini.length - 1];
    if(!ultimo) { alert("Nessuno storico disponibile."); return; }
    selezionaTipologia(ultimo.tipologia);
    oreSelezionate = ultimo.ore;
    document.getElementById('inputNote').value = ultimo.note;
    document.getElementById('inputSpese').value = ultimo.speseAnticipate;
    if(ultimo.tipologia === 'LAVORO') {
        document.getElementById('selectCliente').value = ultimo.clienteId;
        aggiornaCantieri();
        document.getElementById('selectCantiere').value = ultimo.cantiereId || '';
        aggiornaInterni();
        document.getElementById('selectInterno').value = ultimo.internoId || '';
    }
    aggiornaUIlOre();
    alert("Configurazione ripristinata!");
}

function registraRapportino() {
    const dataInput = document.getElementById('dataRapportino').value;
    if(!dataInput) { alert("Seleziona una data valida."); return; }
    const parti = dataInput.split('-');
    const dataFormattata = `${parti[2]}/${parti[1]}/${parti[0]}`;

    let clienteId = "ASSENTE", clienteNome = "Non Specificato", cantiereId = null, cantiereNome = null, internoId = null, internoCodice = null;

    if(tipologiaAttuale === 'LAVORO') {
        clienteId = document.getElementById('selectCliente').value;
        if(!clienteId) { alert("Seleziona un cliente."); return; }
        const cl = db.clienti.find(c => c.id === clienteId);
        clienteNome = cl.nome;

        cantiereId = document.getElementById('selectCantiere').value;
        if(cantiereId) {
            const ca = cl.cantieri.find(c => c.id === cantiereId);
            cantiereNome = ca.nome;
        }

        internoId = document.getElementById('selectInterno').value;
        if(internoId) {
            const clObj = db.clienti.find(c => c.id === clienteId);
            const caObj = clObj?.cantieri.find(c => c.id === cantiereId);
            const inObj = caObj?.interni.find(i => i.id === internoId);
            internoCodice = inObj?.codice;
        }
    }

    const duplicato = db.rapportini.some(r => r.data === dataFormattata && (tipologiaAttuale !== 'LAVORO' ? r.tipologia === tipologiaAttuale : (r.tipologia === 'LAVORO' && r.cantiereId === cantiereId && r.internoId === internoId)));
    if(duplicato) {
        if(!confirm("Hai già inserito una voce simile in questa data. Vuoi procedere comunque?")) return;
    }

    db.rapportini.push({
        id: 'rap_' + Date.now(),
        data: dataFormattata,
        clienteId, clienteNome, cantiereId, cantiereNome, internoId, internoCodice,
        tipologia: tipologiaAttuale,
        ore: oreSelezionate,
        note: document.getElementById('inputNote').value.replace(/;/g, ','),
        speseAnticipate: parseFloat(document.getElementById('inputSpese').value) || 0.0
    });

    document.getElementById('inputNote').value = '';
    document.getElementById('inputSpese').value = '0.0';
    salvaDB();
    alert("Rapportino Registrato!");
}

const mesiNomi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

function cambiaMese(dir) {
    meseSelezionato += dir;
    if(meseSelezionato > 11) { meseSelezionato = 0; annoSelezionato++; }
    else if(meseSelezionato < 0) { meseSelezionato = 11; annoSelezionato--; }
    renderPlancia();
}

function renderCantieriFiltro() {
    renderPlancia();
}

function renderPlancia() {
    document.getElementById('labelMeseAnno').innerText = `${mesiNomi[meseSelezionato]} ${annoSelezionato}`;
    
    const selFiltroCl = document.getElementById('filtroCliente');
    const valClF = selFiltroCl.value;
    selFiltroCl.innerHTML = '<option value="">Tutti i Clienti</option>';
    db.clienti.forEach(cl => {
        selFiltroCl.innerHTML += `<option value="${cl.id}">${cl.nome}</option>`;
    });
    selFiltroCl.value = valClF;

    const tipoFiltro = document.getElementById('filtroTipo').value;
    const clienteFiltro = document.getElementById('filtroCliente').value;
    const ricerca = document.getElementById('inputRicerca').value.toLowerCase();

    const filtrati = db.rapportini.filter(r => {
        const p = r.data.split('/');
        if(p.length !== 3) return false;
        const a = parseInt(p[2]), m = parseInt(p[1]) - 1;
        if(a !== annoSelezionato || m !== meseSelezionato) return false;
        if(tipoFiltro !== 'TUTTI' && r.tipologia !== tipoFiltro) return false;
        if(clienteFiltro && r.clienteId !== clienteFiltro) return false;
        if(ricerca && !r.clienteNome.toLowerCase().includes(ricerca) && !(r.cantiereNome||'').toLowerCase().includes(ricerca) && !(r.internoCodice||'').toLowerCase().includes(ricerca) && !r.note.toLowerCase().includes(ricerca)) return false;
        return true;
    }).sort((a,b) => parseInt(a.data.split('/')[0]) - parseInt(b.data.split('/')[0]));

    let ord = 0, stra = 0, spese = 0;
    filtrati.forEach(r => {
        if(r.tipologia === 'LAVORO') {
            ord += r.ore;
            spese += r.speseAnticipate;
        }
    });

    document.getElementById('totOrd').innerText = ord + 'h';
    document.getElementById('totStra').innerText = stra + 'h';
    document.getElementById('totSpese').innerText = '€' + spese;

    let feriali = 0;
    const oggi = new Date();
    const maxG = new Date(annoSelezionato, meseSelezionato + 1, 0).getDate();
    const limiteG = (annoSelezionato === oggi.getFullYear() && meseSelezionato === oggi.getMonth()) ? oggi.getDate() : maxG;
    for(let g=1; g<=limiteG; g++) {
        const d = new Date(annoSelezionato, meseSelezionato, g);
        const dow = d.getDay();
        if(dow !== 0 && dow !== 6) feriali++;
    }
    const oreRichieste = feriali * 8;
    document.getElementById('allineamentoFeriali').innerText = `Allineamento Ore Feriali: ${ord}/${oreRichieste}h`;
    document.getElementById('barraProgresso').style.width = Math.min(100, (oreRichieste>0?(ord/oreRichieste)*100:0)) + '%';

    const container = document.getElementById('listaRapportiniPlancia');
    container.innerHTML = '';
    
    const raggruppati = {};
    filtrati.forEach(r => {
        if(!raggruppati[r.data]) raggruppati[r.data] = [];
        raggruppati[r.data].push(r);
    });

    for(const [data, lista] of Object.entries(raggruppati)) {
        let righe = '';
        lista.forEach(r => {
            righe += `<div class="flex-between" style="padding: 8px 0; border-bottom: 1px solid var(--surface-variant);">
                <div>
                    <strong>${r.clienteNome} → ${r.cantiereNome || 'Generico'} [${r.internoCodice || '-'}]</strong><br>
                    <span class="text-sm text-green">Ore: ${r.ore}h (${r.tipologia}) ${r.speseAnticipate>0?'| Spese: €'+r.speseAnticipate:''}</span><br>
                    ${r.note?`<span class="text-sm">Note: ${r.note}</span>`:''}
                </div>
                <div>
                    <span style="color:var(--danger); cursor:pointer; font-size:12px; padding: 6px;" onclick="eliminaRapportino('${r.id}')">Elimina</span>
                </div>
            </div>`;
        });
        container.innerHTML += `<div class="card"><strong>Giornata: ${data}</strong>${righe}</div>`;
    }
}

function eliminaRapportino(id) {
    if(confirm("Eliminare questo rapportino?")) {
        db.rapportini = db.rapportini.filter(r => r.id !== id);
        salvaDB();
    }
}

function verificaBuchi() {
    const oggi = new Date();
    const maxG = new Date(annoSelezionato, meseSelezionato + 1, 0).getDate();
    const limiteG = (annoSelezionato === oggi.getFullYear() && meseSelezionato === oggi.getMonth()) ? oggi.getDate() : maxG;
    const mancanti = [];

    for(let g=1; g<=limiteG; g++) {
        const d = new Date(annoSelezionato, meseSelezionato, g);
        const dow = d.getDay();
        if(dow !== 0 && dow !== 6) {
            const dataStr = `${String(g).padStart(2,'0')}/${String(meseSelezionato+1).padStart(2,'0')}/${annoSelezionato}`;
            const haRap = db.rapportini.some(r => r.data === dataStr);
            if(!haRap) mancanti.push(dataStr);
        }
    }

    const cont = document.getElementById('contenutoBuchi');
    if(mancanti.length === 0) {
        cont.innerHTML = '<p class="text-green">Ottimo! Il tuo registro è completo per questo mese.</p>';
    } else {
        cont.innerHTML = '<p>Mancano i rapportini nei giorni:</p>' + mancanti.map(d => `<br>• ${d}`).join('');
    }
    document.getElementById('modalBuchi').style.display = 'flex';
}

function apriModalOperaio() {
    document.getElementById('inputNomeOperaioModal').value = db.nomeOperaio;
    document.getElementById('modalOperaio').style.display = 'flex';
}
function salvaNomeOperaio() {
    db.nomeOperaio = document.getElementById('inputNomeOperaioModal').value || 'Operaio';
    chiudiModali();
    salvaDB();
}

function esportaJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "registro_ore_backup.json");
    dlAnchorElem.click();
}

function importaJSON(event) {
    const file = event.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            db = JSON.parse(e.target.result);
            salvaDB();
            alert("Database ripristinato con successo!");
        } catch(err) {
            alert("File non valido.");
        }
    };
    reader.readAsText(file);
}

function esportaCSV() {
    let csv = "DATA;CLIENTE;CANTIERE;INTERNO;ORE;TIPOLOGIA;SPESE;NOTE\n";
    db.rapportini.forEach(r => {
        csv += `${r.data};${r.clienteNome};${r.cantiereNome||''};${r.internoCodice||''};${r.ore};${r.tipologia};${r.speseAnticipate};${r.note}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Registro_${mesiNomi[meseSelezionato]}_${annoSelezionato}.csv`;
    a.click();
}
