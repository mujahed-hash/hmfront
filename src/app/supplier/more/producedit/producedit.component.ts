import { Component } from '@angular/core';
import { ActivatedRoute, Router,NavigationEnd  } from '@angular/router';
import { SupplierService } from '../../supplier.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { NotificationService,Notification  } from 'src/app/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-producedit',
  templateUrl: './producedit.component.html',
  styleUrls: ['./producedit.component.scss']
})
export class ProduceditComponent {
  editmode = false;
  form!: FormGroup<any>;
  isSubmitted = false;
  categories: any[] = [];
  imageDisplay!: string | ArrayBuffer | null;
  imagesDisplay: string[] = [];
  currentProductId!: string;
  token!:any
  clickEdit:boolean=false;
  product:any;
  isEditing!:any;
  images:any=[];
  NewCDI: any;
  currentRoute:any;
  filterText:any;
  selectedCategory:any;
  dropdownOpen:Boolean=false;
  selected:any;
  notifications: Notification[] = [];
  isLoading = false; // Loader flag
  private destroy$ = new Subject<void>();

    constructor(
    private route: ActivatedRoute,
    private productService: SupplierService,
    private fb: FormBuilder,
    private router: Router,

    private formBuilder: FormBuilder,
    private productsService: SupplierService,
   private notificationService: NotificationService   
  ) { }

  ngOnInit(): void {
    this._initForm();
    this._getCategories();
    this._checkEditMode();
    this.token = localStorage.getItem('token');
    this.router.events.pipe(
      filter((event:any) => event instanceof NavigationEnd)
    ).subscribe(() => {
      // this.currentRoute = this.router.url;
      console.log(this.currentRoute); // For debugging purposes
      // Now you can use this.currentRoute to show/hide elements in your template
    });
    this.form.get('category')?.valueChanges.subscribe(value => {
      this.selected = this.categories.find(cat => cat.id === value);
      this.selectedCategory = this.selected || null;
    });
  }

  private _initForm() {
    this.form = this.formBuilder.group({
      prodName: ['', Validators.required],
      prodDesc: ['', Validators.required],
      prodPrice: ['', Validators.required],
      images: [],
      category: ['', Validators.required],
      countInStock: ['', Validators.required],
      prodSize: ['', Validators.required],
      isFeatured: [false]
    });
  }
  // isEditRoute(): boolean {
  //   // This method checks if the current route matches the edit route pattern
  //   return this.currentRoute.startsWith('/supplier/product/edit/');
  // }
  private _getCategories() {
    this.productService.getCategories().subscribe((categories: any) => {
      this.categories = categories;
      console.log(categories)
    });
  }

  private _checkEditMode() {
    this.route.params.subscribe((params) => {
      this.productsService.getProductByCustomIdentifier(params['customIdentifier']).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
        this.product = data;
        this.NewCDI = data.customIdentifer;

      });
      if (params['customIdentifier']) {
        this.editmode = true;
        this.currentProductId = params['customIdentifier'];
        this.productsService.getProductByCustomIdentifier(params['customIdentifier']).pipe(takeUntil(this.destroy$)).subscribe((product: any) => {
          this.form.get('category')?.setValue(product.category.id);
          this.form.get('prodName')?.setValue(product.prodName);
          this.form.get('prodDesc')?.setValue(product.prodDesc);
          this.form.get('prodPrice')?.setValue(product.prodPrice);
          this.form.get('countInStock')?.setValue(product.countInStock);
          this.form.get('isFeatured')?.setValue(product.isFeatured);
          this.form.get('prodSize')?.setValue(product.prodSize);

          this.imagesDisplay = product.images;
          this.form.get('images')?.setValidators([]);
          this.form.get('images')?.updateValueAndValidity();
        });
      
      }
    });
  }
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }
  onCategorySelect(event: any) {
    const selected = this.categories.find(cat => cat.id === event.value);
    this.selectedCategory = selected;
  }
  selectCategory(category: any) {
    this.selectedCategory = category;
    this.form.get('category')?.setValue(category.id);
    this.dropdownOpen = false;
  }
  filteredCategories() {
    if (!this.filterText) {
      return this.categories;
    }
    return this.categories.filter(category =>
      category.itemType.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  private _addProduct(productData: FormData) {
    this.productsService.createProduct(productData, this.token).pipe(takeUntil(this.destroy$)).subscribe(()=>
      this.router.navigate(['/supplier/allitems']));
      this.form.reset();

      }
  

      _updateProduct(productFormData: FormData) {
        this.productsService.updateProduct(productFormData, this.currentProductId, this.token).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
          // this.NewCDI.push(data.customIdentifer);
          console.log(this.NewCDI);
          this.router.navigate(['/supplier/product/view/', data.customIdentifer])
       
        });
      }


  // async _addProduct(productFormData: FormData) {
  //   try {
  //     const data = await this.productService.addProduct(productFormData).toPromise();
  //     this.router.navigate(['/supplier/products']);
  //   } catch (error) {
  //     console.error('Error adding product:', error);
  //   }
  // }

  onSubmit() {
    this.isSubmitted = true;
    if (this.form.invalid) return;
    this.isLoading = true; // Start loader
    const productFormData = new FormData();
    Object.keys(this.form.controls).map((key) => {
      productFormData.append(key, this.form.get(key)?.value);
    });

    this.images.forEach((file:any, index:any) => {
      productFormData.append('images', file, file.name);
    });
    if (this.editmode) {
       this._updateProduct(productFormData);
       this.notificationService.addNotification('Item Updated!', 'success');
       this.isLoading = false; // Stop loader
       this.form.reset();
      // this.router.navigate(['/supplier/product/', this.NewCDI[0]])
      // console.log(this.router.navigate(['/supplier/product/', this.NewCDI]))

    } else {
      this._addProduct(productFormData);
      this.notificationService.addNotification('Item Added!', 'success');
      this.router.navigate(['/supplier/allitems']);
      this.isLoading = false; // Stop loader
      this.form.reset();

    }
  }
  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imageDisplay = fileReader.result;
      };
      fileReader.readAsDataURL(file);
    }
  }

  onImagesUpload(event: any) {
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imagesDisplay.push(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  }

  get productForm() {
    return this.form.controls;
  }
  toggleEdit(): void {
    // this.isEditing = !this.isEditing;
    this.router.navigate(['/supplier/product/edit/', this.NewCDI ]);

  }    

  // onFileChange(event: any) {
  //   const imagesControl = this.form.get('images');
  //   imagesControl?.updateValueAndValidity();

  //   if (event.target.files && event.target.files.length) {
  //     const filesAmount = event.target.files.length;

  //     for (let i = 0; i < filesAmount; i++) {
  //       const reader = new FileReader();

  //       reader.onload = (e: any) => {
  //         this.imagesDisplay.push(e.target.result);

  //         // Assuming 'images' control is supposed to hold an array of base64 strings
  //         let currentImages = imagesControl?.value || [];
  //         if (!Array.isArray(currentImages)) {
  //           currentImages = [];
  //         }
  //         currentImages.push(e.target.result);
  //         this.form.patchValue({
  //           images: currentImages
  //         });
  //         imagesControl?.updateValueAndValidity();
  //       };

  //       reader.readAsDataURL(event.target.files[i]);
  //     }
  //   }
  // }
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.images = Array.from(event.target.files);
  
      const fileReaders: FileReader[] = [];
      this.imagesDisplay = [];
  
      this.images.forEach((file: File) => {
        const fileReader = new FileReader();
        fileReader.onload = (e: any) => {
          this.imagesDisplay.push(e.target.result);
        };
        fileReader.readAsDataURL(file);
        fileReaders.push(fileReader);
      });
  
      this.form.patchValue({
        images: this.images
      });
      this.form.get('images')?.updateValueAndValidity();
    }
  }
  
  goto(){
    console.log('clicked');
    this.route.params.subscribe((params) => {
      this.productsService.getProductByCustomIdentifier(params['customIdentifier']).pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
        this.product = data;
        this.router.navigate(['/supplier/product/view/', params['customIdentifier'] ]);
        this.isLoading = false; // Stop loader
      });
  }
)}
ngOnDestroy(): void {
  // Notify all subscriptions to complete
  this.destroy$.next();
  this.destroy$.complete();

}
}