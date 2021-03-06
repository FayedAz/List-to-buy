import { MyAdminModel } from "./MyAdminModel";
import { Db, ObjectID } from "mongodb";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { Result } from "range-parser";
import { isBuffer } from "util";
import { ArticleData } from './ArticleData';
import { MyAsyncModel } from '../MyAsyncModel'
import { DeleteArticleData } from "./DeleteArticleData";


export class MyAdminModelImpl implements MyAdminModel {
    private db : Db;
    private model : MyAsyncModel;
    
    /**
     * Construit un modÃ¨le asynchrone.
     * 
     * @param db Base de donnÃ©es.
     * @param model ModÃ¨le asynchrone.
     */
    constructor(db : Db, model : MyAsyncModel) {
        this.db = db;
        this.model = model;
    }

    /**
    * @see AdminModel#addTeam
    */
    async addArticle(userId: any, data : any) : Promise<any> {
        const articleData : ArticleData = plainToClass<ArticleData, object>(ArticleData, data, {strategy : 'excludeAll' });
        await this.validate(articleData);

        if(articleData.quantity <= 0){
            throw new Error("Quantity must be superior to 0");
        }

        const result = await this.db.collection('lists').insertOne({
            user: userId,
            name: articleData.name,
            quantity: articleData.quantity,
            measure: articleData.measure,
            bought: false
        })
        return result.insertedId;
    }

    /**
    * @see AdminModel#addMatch
    */
    /*async addMatch(data : any) : Promise<any> {
        const matchData : MatchData = plainToClass<MatchData, object>(MatchData, data, {strategy : 'excludeAll' });
        await this.validate(matchData);
        
        const team0 = await this.model.team(matchData.team0) 
        const team1 = await this.model.team(matchData.team1) 
        
        if(team0._id.equals(team1._id)){
            throw new Error("Teams must be different");            
        }

        const score0 = parseInt(matchData.score0);
        const score1 = parseInt(matchData.score1);

        if(score0 < 0 || score1 < 0){
            throw new Error("Scores must be positive")
        }

        if(score0 > 100 || score1 > 100){
            throw new Error("Scores must be less than or equal to 100")
        }

        const result = await this.db.collection('matches').insertOne({
            date : new Date(matchData.date),
            teams : [team0._id, team1._id],
            scores : [score0, score1]
        })

        return result.insertedId;
    }*/

    /**
     * 
     * LÃ¨ve une exception si l'objet passÃ© en paramÃ¨tre n'a pas pu Ãªtre validÃ©.
     * 
     * @param object Objet Ã  valider
     */
    private async validate(object : any) : Promise<void> {
        const errors = await validate(object);
        if (errors.length == 0) return;
        throw errors;
    }

    async archiveArticle(data : any): Promise<void>{
        const archiveArticleData : DeleteArticleData = plainToClass<DeleteArticleData, object>(DeleteArticleData, data, {strategy : 'excludeAll' });
        await this.validate(archiveArticleData);
        await this.db.collection('lists').updateOne({ _id : new ObjectID(archiveArticleData._id)}, {$set:{bought: true}});
        console.log(archiveArticleData._id);
    }

    async cancelBoughtArticle(data : any): Promise<void>{
        const cancelBoughtArticle : DeleteArticleData = plainToClass<DeleteArticleData, object>(DeleteArticleData, data, {strategy : 'excludeAll' });
        await this.validate(cancelBoughtArticle);
        await this.db.collection('lists').updateOne({ _id : new ObjectID(cancelBoughtArticle._id)}, {$set:{bought: false}});
        console.log(cancelBoughtArticle._id);
    }

    async deleteArticle(data : any): Promise<void>{
        const deleteArticle : DeleteArticleData = plainToClass<DeleteArticleData, object>(DeleteArticleData, data, {strategy : 'excludeAll' });
        await this.validate(deleteArticle);
        await this.db.collection('lists').deleteOne({ _id : new ObjectID(deleteArticle._id)});
        console.log(deleteArticle._id);
    }

}