import { Component } from '@angular/core';
import { PrinterService } from '../providers/printer.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { commands } from '../providers/printer-commands';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  nombre = '';
  celular: number = undefined;
  producto = '';
  descripcion = '';
  total: number = undefined;
  abono: number = undefined;
  saldo: number = undefined;

  constructor(
    private printerService: PrinterService,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController
  ) {}

  calcularSaldo() {
    if (this.total && this.total > 0 && this.abono) {
      this.saldo = this.total - this.abono;
    }
  }

  correrCortar() {
    this.print('DC:0D:30:80:E9:5D', this.construirRecibo({
      title: 'PLAYCOMMERCE',
      text: 'aliensanderdiaz',
      nombre: this.nombre,
      celular: this.celular,
      producto: this.producto,
      descripcion: this.descripcion,
      total: this.total,
      abono: this.abono,
      saldo: this.saldo,
    }));
  }

  async print(device, data) {

    // console.log('Device mac: ', device);
    // console.log('Data: ', data);

    const load = await this.loadCtrl.create({
      message: 'Imprimiendo...',
    });

    await load.present();

    this.printerService.connectBluetooth(device).subscribe(
      (status) => {
        console.log(status);
        this.printerService
          .printData(this.noSpecialChars(data))
          .then(async (printStatus) => {
            await load.dismiss();
            console.log(printStatus);
            let alert = await this.alertCtrl.create({
              message: 'Successful print!',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => {
                    load.dismiss();
                    this.printerService.disconnectBluetooth();
                  },
                },
              ],
            });
            await alert.present();
          })
          .catch(async (error) => {
            console.log(error);
            let alert = await this.alertCtrl.create({
              message: 'There was an error printing, please try again!',
              buttons: [
                {
                  text: 'Ok',
                  handler: () => {
                    load.dismiss();
                    //this.printerService.disconnectBluetooth();
                  },
                },
              ],
            });
            await alert.present();
          });
      },
      async (error) => {
        console.log(error);
        let alert = await this.alertCtrl.create({
          message:
            'There was an error connecting to the printer, please try again!',
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                load.dismiss();
                //this.printerService.disconnectBluetooth();
              },
            },
          ],
        });
        await alert.present();
      },
    );
  }

  noSpecialChars(string) {
    let translate = {
      à: 'a',
      á: 'a',
      â: 'a',
      ã: 'a',
      ä: 'a',
      å: 'a',
      æ: 'a',
      ç: 'c',
      è: 'e',
      é: 'e',
      ê: 'e',
      ë: 'e',
      ì: 'i',
      í: 'i',
      î: 'i',
      ï: 'i',
      ð: 'd',
      ñ: 'n',
      ò: 'o',
      ó: 'o',
      ô: 'o',
      õ: 'o',
      ö: 'o',
      ø: 'o',
      ù: 'u',
      ú: 'u',
      û: 'u',
      ü: 'u',
      ý: 'y',
      þ: 'b',
      ÿ: 'y',
      ŕ: 'r',
      À: 'A',
      Á: 'A',
      Â: 'A',
      Ã: 'A',
      Ä: 'A',
      Å: 'A',
      Æ: 'A',
      Ç: 'C',
      È: 'E',
      É: 'E',
      Ê: 'E',
      Ë: 'E',
      Ì: 'I',
      Í: 'I',
      Î: 'I',
      Ï: 'I',
      Ð: 'D',
      Ñ: 'N',
      Ò: 'O',
      Ó: 'O',
      Ô: 'O',
      Õ: 'O',
      Ö: 'O',
      Ø: 'O',
      Ù: 'U',
      Ú: 'U',
      Û: 'U',
      Ü: 'U',
      Ý: 'Y',
      Þ: 'B',
      Ÿ: 'Y',
      Ŕ: 'R',
    };
    let translate_re = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕŕÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÝÝÞŸŔŔ]/gim;
    return string.replace(translate_re, function (match) {
      return translate[match];
    });
  }

  construirRecibo(data) {
    let receipt = '';
    receipt += commands.HARDWARE.HW_INIT;

    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'CLIENTE: ';
    receipt += commands.TEXT_FORMAT.TXT_BOLD_OFF;
    receipt += this.nombre;
    receipt += commands.EOL;


    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'TELEFONO: ';
    receipt += commands.TEXT_FORMAT.TXT_BOLD_OFF;
    receipt += this.celular;
    receipt += commands.EOL;


    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'PRODUCTO: ';
    receipt += commands.TEXT_FORMAT.TXT_BOLD_OFF;
    receipt += this.producto.toUpperCase();
    receipt += commands.EOL;


    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'DESCRIPCION: ';
    receipt += commands.TEXT_FORMAT.TXT_BOLD_OFF;
    receipt += this.descripcion;
    receipt += commands.EOL;


    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'TOTAL: ';
    receipt += commands.TEXT_FORMAT.TXT_BOLD_OFF;
    receipt += this.total;
    receipt += commands.EOL;


    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'ABONO: ';
    receipt += commands.TEXT_FORMAT.TXT_BOLD_OFF;
    receipt += this.abono;
    receipt += commands.EOL;


    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'SALDO: ';
    receipt += commands.TEXT_FORMAT.TXT_BOLD_OFF;
    receipt += this.saldo;
    receipt += commands.EOL;


    return receipt;
  }

}
