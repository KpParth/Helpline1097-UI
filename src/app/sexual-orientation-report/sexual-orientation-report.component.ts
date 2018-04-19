import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { dataService } from '../services/dataService/data.service';
import { UserBeneficiaryData } from '../services/common/userbeneficiarydata.service';
import { ReportsService } from '../services/reports-service/reports-service';
import { ConfirmationDialogsService } from './../services/dialog/confirmation.service';
import { LocationService } from '../services/common/location.service';
import { Angular2Csv } from 'angular2-csv/Angular2-csv'; 

@Component({
  selector: 'app-sexual-orientation-report',
  templateUrl: './sexual-orientation-report.component.html',
  styleUrls: ['./sexual-orientation-report.component.css']
})
export class SexualOrientationReportComponent implements OnInit {

  today: Date;
  start_date: Date;
  end_date: Date;
  maxStartDate: Date;
  maxEndDate: Date;
  tableFlag: boolean = false;
  data = [];
  sexualOrientations = [];
  providerServiceMapID: any;
  @ViewChild('sexualOrientationSearchForm') sexualOrientationSearchForm: NgForm;
  postData: any = [];
  orientations = [];
  states = [];
  districts = [];

  constructor(private dataService: dataService, private userbeneficiarydata: UserBeneficiaryData, 
    private reportsService: ReportsService, private alertService: ConfirmationDialogsService, 
    private locationService: LocationService) { }

  ngOnInit() {
    this.providerServiceMapID = this.dataService.current_service.serviceID;
    this.userbeneficiarydata.getUserBeneficaryData(this.providerServiceMapID)
    .subscribe((response)=>{
      console.log(response);
      this.sexualOrientations = response['sexualOrientations'];
      let all = {
        "sexualOrientation": "All"
      }
      this.sexualOrientations.push(all);
      this.states = response['states'];
    },
    (error)=>{
      this.alertService.alert(error.errorMessage,'error');

      console.log(error);
    })

    this.providerServiceMapID = this.dataService.current_service.serviceID;

    this.today = new Date();
    this.end_date = new Date();
    this.end_date.setDate(this.today.getDate() - 1);
    this.end_date.setHours(23,59,59,0);

    this.start_date = new Date();
   this.start_date.setDate(this.today.getDate()-7);
   this.start_date.setHours(0,0,0,0);

    this.maxStartDate = new Date();
    this.maxStartDate.setDate(this.today.getDate() - 1);
    this.maxStartDate.setHours(0,0,0,0);

    this.maxEndDate = new Date();
        this.maxEndDate.setDate(this.today.getDate() - 1);
    this.maxEndDate.setHours(23,59,59,0);

    //console.log("sd,ed,msd,med", this.start_date, this.end_date, this.maxStartDate, this.maxEndDate);
    //this.minStartDate.setMonth(this.minStartDate.getMonth()-1);
  }

  blockKey(e: any){
      if(e.keyCode===9){
          return true;
      }
      else {
          return false;
      }
  }

  getDistricts(){
    this.districts = [];
    this.sexualOrientationSearchForm.form.patchValue({
      'district': ''
    });
    this.locationService.getDistricts(this.sexualOrientationSearchForm.value.state.stateID)
    .subscribe((response)=>{
      this.districts = response;
    },
    (error)=>{
      this.alertService.alert(error.errorMessage,'error');

      console.log(error);
    })
    console.log(this.sexualOrientations);
  }

  // endDateChange(){
  //   console.log(this.end_date);
  //   // this.minStartDate = new Date(this.end_date);
  //   // this.minStartDate.setMonth(this.minStartDate.getMonth()-1);
  //   // this.start_date = new Date(this.end_date);
  //   // this.start_date.setMonth(this.start_date.getMonth()-1);
  // }

  endDateChange() {

    //console.log("sd,med", this.start_date, this.maxEndDate);
    if(this.today.getTime() < this.maxEndDate.getTime()) {
      let i = new Date();
      i.setDate(this.today.getDate() - 1);
      this.maxEndDate = i;
      this.maxEndDate.setHours(23,59,59,0);
      //console.log("sd,med", this.start_date, this.maxEndDate);
    }
    else {
      this.maxEndDate = new Date(this.start_date);
      this.maxEndDate.setMonth(this.maxEndDate.getMonth()+1);
      this.maxEndDate.setHours(23,59,59,0);
    }

    var timeDiff = this.end_date.getTime() - this.start_date.getTime() ;
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    if(diffDays > 90) {
      var tempDate = new Date(this.start_date);
      tempDate.setMonth(this.start_date.getMonth()+1);
      tempDate.setHours(23,59,59,0);
      this.sexualOrientationSearchForm.form.patchValue({
        'endDate': tempDate
      });
    }
    if(diffDays < 0) {
      var tempDate = new Date(this.start_date);
      tempDate.setHours(23,59,59,0);
      this.sexualOrientationSearchForm.form.patchValue({
        'endDate': tempDate
      });
    }
  }


  
  getReports(){
    console.log("values:", this.sexualOrientationSearchForm.value);
    this.postData = [];
    if(this.sexualOrientationSearchForm.value.sexuality == "All"){
      for(var i=0;i<this.sexualOrientations.length-1;i++){
        var obj = {
          "providerServiceMapID": this.providerServiceMapID,
          "startTimestamp": new Date((this.sexualOrientationSearchForm.value.startDate.getTime() - 1 * (this.sexualOrientationSearchForm.value.startDate.getTimezoneOffset() * 60 * 1000))).toJSON().slice(0, 10) + "T00:00:00.000Z",
          "endTimestamp": new Date((this.sexualOrientationSearchForm.value.endDate.getTime() - 1 * (this.sexualOrientationSearchForm.value.endDate.getTimezoneOffset() * 60 * 1000))).toJSON().slice(0, 10) + "T23:59:59.999Z",
          "beneficiarySexualOrientation": this.sexualOrientations[i].sexualOrientation
        }
        if(this.sexualOrientationSearchForm.value.state!=''){
          obj['beneficiaryState'] = this.sexualOrientationSearchForm.value.state.stateName;
        }
        if(this.sexualOrientationSearchForm.value.district!=''){
          obj['beneficiaryDistrict'] = this.sexualOrientationSearchForm.value.district;
        }
        this.postData.push(obj);
      }

    }
    else {
      //  for(var i=0; i< this.sexualOrientationSearchForm.value.sexuality.length;i++){

        var obj = {
          "providerServiceMapID": this.providerServiceMapID,
          "startTimestamp": new Date((this.sexualOrientationSearchForm.value.startDate.getTime() - 1 * (this.sexualOrientationSearchForm.value.startDate.getTimezoneOffset() * 60 * 1000))).toJSON().slice(0, 10) + "T00:00:00.000Z",
          "endTimestamp": new Date((this.sexualOrientationSearchForm.value.endDate.getTime() - 1 * (this.sexualOrientationSearchForm.value.endDate.getTimezoneOffset() * 60 * 1000))).toJSON().slice(0, 10) + "T23:59:59.999Z",
          "beneficiarySexualOrientation": this.sexualOrientationSearchForm.value.sexuality
        }
        if(this.sexualOrientationSearchForm.value.state!=''){
          obj['beneficiaryState'] = this.sexualOrientationSearchForm.value.state.stateName;
        }
        if(this.sexualOrientationSearchForm.value.district!=''){
          obj['beneficiaryDistrict'] = this.sexualOrientationSearchForm.value.district;
        }
        this.postData.push(obj);
        //  }

      }
      console.log(this.postData);
      this.reportsService.getAllBySexualOrientation(this.postData)
      .subscribe((response)=>{
        console.log(response);
        this.tableFlag = true;
        this.orientations = response;

      },
      (error)=>{
        this.alertService.alert(error.errorMessage,'error');

        console.log(error);
      })
    }

  download_report()
{
  var head=Object.keys(this.orientations[0]);
  new Angular2Csv(this.orientations, 'Sexual Orientation Report', {headers: (head)});
  
        this.alertService.alert('Sexual orientation report downloaded','success');

}

}
