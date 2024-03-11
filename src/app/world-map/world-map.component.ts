import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.component.html',
  styleUrls: ['./world-map.component.scss']
})

export class WorldMapComponent implements AfterViewInit {
  @ViewChild('svgObject') svgObject!: ElementRef;
// country attributes initilization
  currentCountry: any = {
    name: 'Country Name',
    capital: 'Country Capital',
    region: 'Country Region',
    income_level: 'Income Level',
    population: 'Population',
    gdp_per_capita: 'GDP Per Capita',
    literacy_rate: 'Literacy Rate',
    literacy_year: '2020',
    gdp_year: '2020'
  };

  constructor(private http: HttpClient, private change_detector: ChangeDetectorRef) { }

  ngAfterViewInit(): void { 
  }

  onSVGLoad(): void {
    this.accessSVG();
  }
  accessSVG(): void{
    const svgFile = this.svgObject.nativeElement.contentDocument;
    svgFile.documentElement.style.backgroundColor = '#647687'; 
    const countries = svgFile.querySelectorAll('path');
    console.log(`Found ${countries.length} country paths`);
    countries.forEach((country: Element) => {
      //set default background and country colors
      country.setAttribute('style', 'fill: #0094C6;  stroke: #323232; stroke-width: 1px;');
      console.log(`Adding listener to ${country.id}`);
      country.addEventListener('mouseenter', (event: Event) => {
        this.onMouseEnterCountry(event);
        //set hover background and country colors
        country.setAttribute('style', 'fill: #e85505; stroke: #000000; stroke-width: 2px;')
      
    });
    country.addEventListener('mouseleave', (event: Event) => {
      country.setAttribute('style', 'fill: #0094C6;  stroke: #323232; stroke-width: 1px;');
    });
   });
  }
//get the id of the hovered country and call for info
  onMouseEnterCountry(event: Event): void{
    const countryCode = (event.target as Element).getAttribute('id');
    console.log(`Country entered: ${countryCode}`);
    if (countryCode) {
      this.getCountryInfo(countryCode);
    }
  }
  // get countries basic info and call for other details
  getCountryInfo(countryCode: string): void{
    //set the year of data that we want to search for
    const year = 2020;
    const url = `https://api.worldbank.org/v2/country/${countryCode}?format=json`;

    this.http.get<any>(url).subscribe((data: any) => {
      if (data && data[1] && data[1].length > 0){
        const countryInfo = data[1][0];
        this.currentCountry.name = countryInfo.name || 'NA';
        this.currentCountry.capital = countryInfo.capitalCity || 'NA';
        this.currentCountry.region = countryInfo.region.value || 'NA';
        this.currentCountry.income_level = countryInfo.incomeLevel.value || 'NA';
        
        this.getGdpPerCapita(countryCode, year);
        this.getLiteracyRate(countryCode, year);
        this.change_detector.detectChanges();
        console.log("Updated currentCountry:", this.currentCountry);
      }
    }, (error: any) => {
      console.error('ERROR fetching data: ', error);
    });
  }
  getLiteracyRate(countryCode: string, year: number): void {
    const literacyUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/SE.ADT.LITR.ZS?format=json&date=${year}&per_page=1`;
    this.http.get<any>(literacyUrl).subscribe((literacyData: any) => {
      console.log(`Literacy data response for year ${year}:`, literacyData);
      this.currentCountry.literacy_year = year
      if (literacyData[1] && literacyData[1].length > 0 && literacyData[1][0].value != null) {
        this.currentCountry.literacy_rate = literacyData[1][0].value;
        this.change_detector.detectChanges();
      }
      //handle no data found
      else {
        console.log(`No literacy data found for ${countryCode} for ${year}`);
        this.currentCountry.literacy_rate = 'No data';
        this.change_detector.detectChanges();
      }
      // handle error
    }, error => {
      console.error(`Error fetching literacy data for year ${year}:`, error);
      this.currentCountry.literacy_rate = 'Error fetching data';
      this.change_detector.detectChanges();
    });
  }
  getGdpPerCapita(countryCode: string, year: number): void {
    const gdpUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json&date=${year}&per_page=1`;
    this.http.get<any>(gdpUrl).subscribe((gdpData: any) => {
      console.log(`GDP data for year ${year}:`, gdpData);
      this.currentCountry.gdp_year = year;
      if (gdpData[1] && gdpData[1].length > 0 && gdpData[1][0].value != null) {
        this.currentCountry.gdp_per_capita = gdpData[1][0].value;
        this.change_detector.detectChanges();
      }
      //handle no data found
      else {
        console.log(`No GDP data found for ${countryCode} for ${year}`);
        this.currentCountry.gdp_per_capita = 'No data';
        this.change_detector.detectChanges();
      }
      //handle error
    }, error => {
      console.error(`Error fetching GDP data for year ${year}:`, error);
      this.currentCountry.gdp_per_capita = 'Error fetching data';
      this.change_detector.detectChanges();
    });
  }
  
}