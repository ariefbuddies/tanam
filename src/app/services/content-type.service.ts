import * as firebase from 'firebase/app';
import { Injectable } from '@angular/core';
import { AngularFirestore, QueryDocumentSnapshot, AngularFirestoreDocument, CollectionReference } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { FirebaseApp } from '@angular/fire';
import { UrlSegment } from '@angular/router';

export type ContentTypeFieldFormElements = 'text-line' | 'text-area' | 'html' | 'number' | 'date' | 'slide-toggle';
export interface ContentTypeField {
  key: string;
  title: string;
  type: ContentTypeFieldFormElements;
}

export interface ContentType {
  id: string; // Document id
  title: string; // Presentation name
  slug: string; // Root slug to group entries by
  template: string;
  standalone: boolean; // True if the content can be presented on a page with URL of its own
  description?: string;
  icon: string; // Icon for menus etc
  fields: ContentTypeField[];
  numEntries: { [key: string]: number };
  updatedAt: Date | firebase.firestore.FieldValue;
  createdAt: Date | firebase.firestore.FieldValue;
}

@Injectable({
  providedIn: 'root'
})
export class ContentTypeService {

  constructor(
    private readonly firestore: AngularFirestore,
    private readonly fbApp: FirebaseApp,
  ) { }

  async createContentType(contentTypeId: string) {
    const contentTypeDocument = this.firestore.collection('tanam-content-types').doc(contentTypeId);
    return this.fbApp.firestore()
      .runTransaction<AngularFirestoreDocument>(async (trx) => {
        const doc = await trx.get(contentTypeDocument.ref);
        if (!doc.exists) {
          trx.set(contentTypeDocument.ref, {
            id: contentTypeId,
            title: contentTypeId,
            slug: contentTypeId,
            template: null,
            standalone: true,
            icon: 'cloud',
            fields: [],
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          } as ContentType);
        }

        return contentTypeDocument;
      });
  }

  getContentTypes() {
    return this.firestore
      .collection<ContentType>('tanam-content-types')
      .valueChanges();
  }

  getContentType(contentTypeId: string) {
    return this.firestore
      .collection('tanam-content-types').doc<ContentType>(contentTypeId)
      .valueChanges();
  }
}
